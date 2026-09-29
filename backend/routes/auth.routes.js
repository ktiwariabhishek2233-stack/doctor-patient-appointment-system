import express from 'express';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Patient } from '../models/Patient.js';
import { AvailableSlot } from '../models/AvailableSlot.js';
import { generateToken, protect } from '../middleware/auth.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import * as supabaseDb from '../services/supabaseDb.js';

const router = express.Router();

// Helper to assemble full user object for frontend compatibility (MongoDB fallback)
const formatMongoUserResponse = async (user) => {
  let extra = {};
  if (user.role === 'doctor') {
    const doc = await Doctor.findOne({ user: user._id });
    if (doc) {
      extra = {
        doctorId: doc._id.toString(),
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        about: doc.about
      };
    }
  } else if (user.role === 'patient') {
    const pat = await Patient.findOne({ user: user._id });
    if (pat) {
      extra = {
        patientId: pat._id.toString(),
        age: pat.age,
        gender: pat.gender,
        address: pat.address,
        phone: pat.phone
      };
    }
  }

  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...extra
  };
};

// @route   POST /api/auth/register
// @desc    Register a patient or doctor
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      age,
      gender,
      address,
      phone,
      specialization,
      qualification,
      experience,
      about
    } = req.body;

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password || !name || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // --- SUPABASE PATH ---
    if (isSupabaseConfigured()) {
      const existingUser = await supabaseDb.findUserByEmail(cleanEmail);
      if (existingUser) {
        return res.status(400).json({
          message: `The email address "${cleanEmail}" is already registered. Please log in.`
        });
      }

      const formattedUser = await supabaseDb.createUserWithProfile({
        name,
        email: cleanEmail,
        password,
        role,
        age,
        gender,
        address,
        phone,
        specialization,
        qualification,
        experience,
        about
      });

      const token = generateToken(formattedUser.id);
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: formattedUser
      });
    }

    // --- MONGO FALLBACK PATH ---
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        message: `The email address "${cleanEmail}" is already registered. Please log in.`
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role
    });

    if (role === 'doctor') {
      const docName = name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`;
      const expStr = experience?.toLowerCase().includes('year') ? experience : `${experience || '1'} Years`;

      const doctor = await Doctor.create({
        user: user._id,
        name: docName,
        email: cleanEmail,
        specialization: specialization || 'General Physician',
        qualification: qualification || 'MBBS',
        experience: expStr,
        about: about || `Specialist in ${specialization || 'General Medicine'} with ${expStr} experience.`
      });

      const defaultTimes = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
      await AvailableSlot.insertMany(
        defaultTimes.map(time => ({
          doctorId: doctor._id,
          time,
          status: 'Available'
        }))
      );
    } else {
      await Patient.create({
        user: user._id,
        name: name.trim(),
        email: cleanEmail,
        age: Number(age) || 30,
        gender: gender || 'Male',
        address: address || '',
        phone: phone || '555-0199'
      });
    }

    const formattedUser = await formatMongoUserResponse(user);
    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: formattedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // --- SUPABASE PATH ---
    if (isSupabaseConfigured()) {
      const user = await supabaseDb.findUserByEmail(cleanEmail);
      if (!user) {
        return res.status(404).json({
          message: `No account found with email "${cleanEmail}". Please check your email or register.`
        });
      }

      if (role && user.role !== role) {
        return res.status(400).json({
          message: `This email is registered as a ${user.role === 'doctor' ? 'Doctor' : 'Patient'}. Please select "${user.role === 'doctor' ? 'Doctor' : 'Patient'}" to log in.`
        });
      }

      const isMatch = await supabaseDb.verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password. Please try again.' });
      }

      const formattedUser = await supabaseDb.formatUserResponse(user);
      const token = generateToken(user.id);

      return res.json({
        message: 'Login successful',
        token,
        user: formattedUser
      });
    }

    // --- MONGO FALLBACK PATH ---
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        message: `No account found with email "${cleanEmail}". Please check your email or register.`
      });
    }

    if (role && user.role !== role) {
      return res.status(400).json({
        message: `This email is registered as a ${user.role === 'doctor' ? 'Doctor' : 'Patient'}. Please select "${user.role === 'doctor' ? 'Doctor' : 'Patient'}" to log in.`
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please try again.' });
    }

    const formattedUser = await formatMongoUserResponse(user);
    const token = generateToken(user._id);

    return res.json({
      message: 'Login successful',
      token,
      user: formattedUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user info
router.get('/me', protect, async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const formattedUser = await supabaseDb.formatUserResponse(req.user);
      return res.json({ user: formattedUser });
    }

    const formattedUser = await formatMongoUserResponse(req.user);
    return res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ message: 'Server error retrieving user data' });
  }
});

export default router;
