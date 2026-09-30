import express from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient.js';
import { User } from '../models/User.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import * as supabaseDb from '../services/supabaseDb.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const patients = await supabaseDb.getAllPatients();
      return res.json(patients);
    }

    const patients = await Patient.find().lean();
    return res.json(patients.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      name: p.name,
      email: p.email,
      age: p.age,
      gender: p.gender,
      address: p.address,
      phone: p.phone
    })));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({ message: 'Failed to fetch patients' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const patient = await supabaseDb.getPatientById(id);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      return res.json(patient);
    }

    let patient = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      patient = await Patient.findById(id);
      if (!patient) {
        patient = await Patient.findOne({ user: id });
      }
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json({
      id: patient._id.toString(),
      _id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      phone: patient.phone
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return res.status(500).json({ message: 'Failed to fetch patient' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const patient = await supabaseDb.updatePatientProfile(id, req.body);
      if (!patient) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      return res.json({
        message: 'Patient profile updated successfully',
        patient
      });
    }

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

    const { name, email, age, gender, address, phone } = req.body;
    if (name) patient.name = name.trim();
    if (email) patient.email = email.trim().toLowerCase();
    if (age !== undefined) patient.age = Number(age);
    if (gender) patient.gender = gender;
    if (address !== undefined) patient.address = address;
    if (phone) patient.phone = phone;

    await patient.save();

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

export default router;
