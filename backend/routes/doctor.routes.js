import express from 'express';
import mongoose from 'mongoose';
import { Doctor } from '../models/Doctor.js';
import { AvailableSlot } from '../models/AvailableSlot.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import * as supabaseDb from '../services/supabaseDb.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const doctors = await supabaseDb.getAllDoctors();
      return res.json(doctors);
    }

    const doctors = await Doctor.find().populate('slots').lean();
    const formatted = doctors.map(doc => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience: doc.experience,
      about: doc.about,
      slots: (doc.slots || []).map(s => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        time: s.time,
        status: s.status,
        date: s.date
      }))
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ message: 'Failed to fetch doctors list' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const doctor = await supabaseDb.getDoctorById(id);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      return res.json(doctor);
    }

    let doctor = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doctor = await Doctor.findById(id).populate('slots');
      if (!doctor) {
        doctor = await Doctor.findOne({ user: id }).populate('slots');
      }
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const formatted = {
      id: doctor._id.toString(),
      _id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      about: doctor.about,
      slots: (doctor.slots || []).map(s => ({
        id: s._id.toString(),
        _id: s._id.toString(),
        time: s.time,
        status: s.status,
        date: s.date
      }))
    };

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    return res.status(500).json({ message: 'Failed to fetch doctor details' });
  }
});

router.post('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { time, date } = req.body;

    if (!time) {
      return res.status(400).json({ message: 'Slot time is required' });
    }

    if (isSupabaseConfigured()) {
      const slot = await supabaseDb.addDoctorSlot(id, { time, date });
      return res.status(201).json({
        message: 'Slot added successfully',
        slot
      });
    }

    let doctor = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doctor = await Doctor.findById(id);
      if (!doctor) {
        doctor = await Doctor.findOne({ user: id });
      }
    }

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const existingSlot = await AvailableSlot.findOne({
      doctorId: doctor._id,
      time: time.trim()
    });

    if (existingSlot) {
      return res.status(400).json({ message: `Slot for ${time} already exists` });
    }

    const newSlot = await AvailableSlot.create({
      doctorId: doctor._id,
      time: time.trim(),
      date: date || '',
      status: 'Available'
    });

    return res.status(201).json({
      message: 'Slot added successfully',
      slot: {
        id: newSlot._id.toString(),
        _id: newSlot._id.toString(),
        doctorId: doctor._id.toString(),
        time: newSlot.time,
        date: newSlot.date,
        status: newSlot.status
      }
    });
  } catch (error) {
    console.error('Error adding slot:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to add slot' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const doctor = await supabaseDb.updateDoctorProfile(id, req.body);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      return res.json({
        message: 'Doctor profile updated successfully',
        doctor
      });
    }

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

    const { name, email, specialization, qualification, experience, about } = req.body;
    if (name) doctor.name = name.trim();
    if (email) doctor.email = email.trim().toLowerCase();
    if (specialization) doctor.specialization = specialization.trim();
    if (qualification) doctor.qualification = qualification.trim();
    if (experience) doctor.experience = experience.trim();
    if (about !== undefined) doctor.about = about;

    await doctor.save();

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
