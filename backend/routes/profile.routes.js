import express from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient.js';
import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';

const router = express.Router();

// @route   PUT /api/patients/:id
// @desc    Update patient profile
router.put('/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, gender, address, phone } = req.body;

    let patient = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id);
      if (!patient) {
        patient = await Patient.findOne({ user: id });
      }
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (name) patient.name = name.trim();
    if (email) patient.email = email.trim().toLowerCase();
    if (age !== undefined) patient.age = Number(age);
    if (gender) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (phone) patient.phone = phone;

    await patient.save();

    // Also update parent User name/email if present
    if (patient.user) {
      await User.findByIdAndUpdate(patient.user, {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() })
      });
    }

    return res.json({
      message: 'Patient profile updated successfully',
      patient: {
        id: patient._id.toString(),
        _id: patient._id.toString(),
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        address: patient.address,
        phone: patient.phone
      }
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return res.status(500).json({ message: 'Failed to update patient profile' });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor profile
router.put('/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, qualification, experience, about } = req.body;

    let doctor = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doctor = await Doctor.findById(id);
      if (!doctor) {
        doctor = await Doctor.findOne({ user: id });
      }
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (name) doctor.name = name.trim();
    if (email) doctor.email = email.trim().toLowerCase();
    if (specialization) doctor.specialization = specialization.trim();
    if (qualification) doctor.qualification = qualification.trim();
    if (experience) doctor.experience = experience.trim();
    if (about !== undefined) doctor.about = about;

    await doctor.save();

    // Also update parent User name/email if present
    if (doctor.user) {
      await User.findByIdAndUpdate(doctor.user, {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() })
      });
    }

    return res.json({
      message: 'Doctor profile updated successfully',
      doctor: {
        id: doctor._id.toString(),
        _id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
        about: doctor.about
      }
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return res.status(500).json({ message: 'Failed to update doctor profile' });
  }
});

export default router;
