import express from 'express';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { AvailableSlot } from '../models/AvailableSlot.js';
import { Doctor } from '../models/Doctor.js';
import { isSupabaseConfigured } from '../config/supabase.js';
import * as supabaseDb from '../services/supabaseDb.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      patientName,
      patientAge,
      patientGender,
      patientAddress,
      patientEmail,
      patientId,
      doctorId,
      doctorName,
      specialization,
      date,
      time,
      reason
    } = req.body;

    if (!doctorId || !date || !time || !patientEmail) {
      return res.status(400).json({ message: 'Missing required appointment details' });
    }

    if (isSupabaseConfigured()) {
      const appointment = await supabaseDb.bookAppointment(req.body);
      return res.status(201).json({
        message: 'Appointment booked successfully',
        appointment
      });
    }

    let doc = null;
    if (mongoose.Types.ObjectId.isValid(doctorId)) {
      doc = await Doctor.findById(doctorId);
    }
    if (!doc) {
      doc = await Doctor.findOne({
        $or: [{ name: doctorName }, { email: doctorId }]
      });
    }

    const actualDoctorId = doc ? doc._id : doctorId;
    const actualDoctorName = doc ? doc.name : (doctorName || 'Doctor');
    const actualSpec = doc ? doc.specialization : (specialization || 'General Physician');

    const existingActiveAppointment = await Appointment.findOne({
      doctorId: actualDoctorId,
      date: date.trim(),
      time: time.trim(),
      status: { $in: ['PENDING', 'ACCEPTED'] }
    });

    if (existingActiveAppointment) {
      return res.status(400).json({
        message: `This slot (${time} on ${date}) is already booked. Please choose another slot.`
      });
    }

    let slot = await AvailableSlot.findOne({
      doctorId: actualDoctorId,
      time: time.trim()
    });

    if (slot) {
      if (slot.status === 'Booked') {
        return res.status(400).json({ message: `Slot ${time} is already marked as Booked.` });
      }
      slot.status = 'Booked';
      await slot.save();
    } else {
      await AvailableSlot.create({
        doctorId: actualDoctorId,
        time: time.trim(),
        date: date.trim(),
        status: 'Booked'
      });
    }

    const appointment = await Appointment.create({
      patientName: patientName || 'Patient',
      patientAge: Number(patientAge) || 30,
      patientGender: patientGender || 'Female',
      patientAddress: patientAddress || '',
      patientEmail: patientEmail.trim().toLowerCase(),
      patientId: mongoose.Types.ObjectId.isValid(patientId) ? patientId : undefined,
      doctorId: actualDoctorId,
      doctorName: actualDoctorName,
      specialization: actualSpec,
      date: date.trim(),
      time: time.trim(),
      reason: reason || 'General medical consultation',
      status: 'PENDING'
    });

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id.toString(),
        _id: appointment._id.toString(),
        patientName: appointment.patientName,
        patientAge: appointment.patientAge,
        patientGender: appointment.patientGender,
        patientAddress: appointment.patientAddress,
        patientEmail: appointment.patientEmail,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId.toString(),
        doctorName: appointment.doctorName,
        specialization: appointment.specialization,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Failed to book appointment' });
  }
});

router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const appointments = await supabaseDb.getAppointments(req.query);
      return res.json(appointments);
    }

    const { patientId, doctorId, patientEmail, status } = req.query;
    const filter = {};

    if (patientId && mongoose.Types.ObjectId.isValid(patientId)) {
      filter.patientId = patientId;
    }
    if (patientEmail) {
      filter.patientEmail = patientEmail.trim().toLowerCase();
    }
    if (doctorId) {
      if (mongoose.Types.ObjectId.isValid(doctorId)) {
        filter.doctorId = doctorId;
      } else {
        const doc = await Doctor.findOne({
          $or: [
            { user: mongoose.Types.ObjectId.isValid(doctorId) ? doctorId : undefined },
            { name: new RegExp(doctorId, 'i') }
          ]
        });
        if (doc) filter.doctorId = doc._id;
      }
    }
    if (status) {
      filter.status = status.toUpperCase();
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).lean();

    const formatted = appointments.map(apt => ({
      id: apt._id.toString(),
      _id: apt._id.toString(),
      patientName: apt.patientName,
      patientAge: apt.patientAge,
      patientGender: apt.patientGender,
      patientAddress: apt.patientAddress,
      patientEmail: apt.patientEmail,
      patientId: apt.patientId ? apt.patientId.toString() : undefined,
      doctorId: apt.doctorId ? apt.doctorId.toString() : undefined,
      doctorName: apt.doctorName,
      specialization: apt.specialization,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      status: apt.status,
      createdAt: apt.createdAt
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    if (isSupabaseConfigured()) {
      const appointment = await supabaseDb.updateAppointmentStatus(id, status);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
      return res.json({
        message: `Appointment ${appointment.status.toLowerCase()} successfully`,
        appointment
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status.toUpperCase();
    await appointment.save();

    if (appointment.status === 'REJECTED') {
      await AvailableSlot.findOneAndUpdate(
        {
          doctorId: appointment.doctorId,
          time: appointment.time
        },
        { status: 'Available' }
      );
    }

    return res.json({
      message: `Appointment ${appointment.status.toLowerCase()} successfully`,
      appointment: {
        id: appointment._id.toString(),
        _id: appointment._id.toString(),
        patientName: appointment.patientName,
        patientAge: appointment.patientAge,
        patientGender: appointment.patientGender,
        patientAddress: appointment.patientAddress,
        patientEmail: appointment.patientEmail,
        doctorId: appointment.doctorId.toString(),
        doctorName: appointment.doctorName,
        specialization: appointment.specialization,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ message: 'Failed to update appointment' });
  }
});

export default router;
