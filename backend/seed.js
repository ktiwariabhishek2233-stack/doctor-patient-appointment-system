import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { Doctor } from './models/Doctor.js';
import { Patient } from './models/Patient.js';
import { AvailableSlot } from './models/AvailableSlot.js';
import { Appointment } from './models/Appointment.js';
import { MedicalReport } from './models/MedicalReport.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mediconnect');
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await AvailableSlot.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalReport.deleteMany({});
    console.log('Cleared existing collections.');

    const alexUser = await User.create({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'password123',
      role: 'patient'
    });
    const alexPatient = await Patient.create({
      user: alexUser._id,
      name: 'Alex Morgan',
      email: 'alex@example.com',
      age: 30,
      gender: 'Female',
      address: '123 Main Street, Cityville',
      phone: '555-0199'
    });

    const robertUser = await User.create({
      name: 'Robert Sterling',
      email: 'robert@example.com',
      password: 'password123',
      role: 'patient'
    });
    const robertPatient = await Patient.create({
      user: robertUser._id,
      name: 'Robert Sterling',
      email: 'robert@example.com',
      age: 45,
      gender: 'Male',
      address: '456 Oak Avenue, Metropolis',
      phone: '555-0188'
    });

    const doctorsRaw = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah@mediconnect.org',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: '10 Years',
        about: 'Specialist in heart health, blood pressure management, and cardiovascular diagnostics.',
        slots: [
          { time: '09:00 AM', status: 'Available' },
          { time: '10:00 AM', status: 'Available' },
          { time: '11:00 AM', status: 'Booked' },
          { time: '02:00 PM', status: 'Available' },
          { time: '04:00 PM', status: 'Booked' }
        ]
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus@mediconnect.org',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD (Neurology)',
        experience: '12 Years',
        about: 'Expert in neurological disorders, migraine treatments, and brain health.',
        slots: [
          { time: '09:30 AM', status: 'Available' },
          { time: '11:00 AM', status: 'Available' },
          { time: '01:30 PM', status: 'Booked' },
          { time: '03:00 PM', status: 'Available' }
        ]
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena@mediconnect.org',
        specialization: 'Pediatrician',
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        experience: '8 Years',
        about: 'Specialist in child health, vaccinations, and infant care.',
        slots: [
          { time: '10:00 AM', status: 'Available' },
          { time: '11:30 AM', status: 'Available' },
          { time: '02:30 PM', status: 'Available' },
          { time: '04:30 PM', status: 'Booked' }
        ]
      },
      {
        name: 'Dr. Jonathan Reyes',
        email: 'jonathan@mediconnect.org',
        specialization: 'Dermatologist',
        qualification: 'MBBS, MD (Dermatology)',
        experience: '9 Years',
        about: 'Expert in skin allergies, hair treatments, and cosmetic skincare.',
        slots: [
          { time: '09:00 AM', status: 'Available' },
          { time: '12:00 PM', status: 'Booked' },
          { time: '02:00 PM', status: 'Available' },
          { time: '04:30 PM', status: 'Available' }
        ]
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael@mediconnect.org',
        specialization: 'Orthopedic',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '11 Years',
        about: 'Specialist in bone fractures, joint pain, spine care, and arthritis.',
        slots: [
          { time: '08:30 AM', status: 'Available' },
          { time: '10:30 AM', status: 'Booked' },
          { time: '01:00 PM', status: 'Available' },
          { time: '03:30 PM', status: 'Available' }
        ]
      },
      {
        name: 'Dr. Emily Watson',
        email: 'emily@mediconnect.org',
        specialization: 'General Physician',
        qualification: 'MBBS, MD (General Medicine)',
        experience: '7 Years',
        about: 'Provides primary health checkups, fever care, and chronic disease management.',
        slots: [
          { time: '09:00 AM', status: 'Available' },
          { time: '10:00 AM', status: 'Available' },
          { time: '11:30 AM', status: 'Available' },
          { time: '03:00 PM', status: 'Booked' },
          { time: '05:00 PM', status: 'Available' }
        ]
      }
    ];

    const doctorMap = {};

    for (const d of doctorsRaw) {
      const docUser = await User.create({
        name: d.name,
        email: d.email,
        password: 'password123',
        role: 'doctor'
      });

      const docDoc = await Doctor.create({
        user: docUser._id,
        name: d.name,
        email: d.email,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        about: d.about
      });

      doctorMap[d.name] = docDoc;

      for (const s of d.slots) {
        await AvailableSlot.create({
          doctorId: docDoc._id,
          time: s.time,
          status: s.status
        });
      }
    }

    await Appointment.create([
      {
        patientName: 'Alex Morgan',
        patientAge: 30,
        patientGender: 'Female',
        patientAddress: '123 Main Street, Cityville',
        patientEmail: 'alex@example.com',
        patientId: alexPatient._id,
        doctorId: doctorMap['Dr. Sarah Jenkins']._id,
        doctorName: 'Dr. Sarah Jenkins',
        specialization: 'Cardiologist',
        date: '2026-08-25',
        time: '11:00 AM',
        reason: 'Chest pain and routine heart checkup.',
        status: 'ACCEPTED'
      },
      {
        patientName: 'Robert Sterling',
        patientAge: 45,
        patientGender: 'Male',
        patientAddress: '456 Oak Avenue, Metropolis',
        patientEmail: 'robert@example.com',
        patientId: robertPatient._id,
        doctorId: doctorMap['Dr. Sarah Jenkins']._id,
        doctorName: 'Dr. Sarah Jenkins',
        specialization: 'Cardiologist',
        date: '2026-08-26',
        time: '02:00 PM',
        reason: 'High blood pressure consultation.',
        status: 'PENDING'
      },
      {
        patientName: 'Alex Morgan',
        patientAge: 30,
        patientGender: 'Female',
        patientAddress: '123 Main Street, Cityville',
        patientEmail: 'alex@example.com',
        patientId: alexPatient._id,
        doctorId: doctorMap['Dr. Marcus Vance']._id,
        doctorName: 'Dr. Marcus Vance',
        specialization: 'Neurologist',
        date: '2026-08-27',
        time: '09:30 AM',
        reason: 'Severe migraine and headache symptoms.',
        status: 'PENDING'
      },
      {
        patientName: 'Robert Sterling',
        patientAge: 45,
        patientGender: 'Male',
        patientAddress: '456 Oak Avenue, Metropolis',
        patientEmail: 'robert@example.com',
        patientId: robertPatient._id,
        doctorId: doctorMap['Dr. Michael Chen']._id,
        doctorName: 'Dr. Michael Chen',
        specialization: 'Orthopedic',
        date: '2026-08-15',
        time: '10:30 AM',
        reason: 'Right knee joint sprain.',
        status: 'COMPLETED'
      }
    ]);

    await MedicalReport.create([
      {
        patientName: 'Alex Morgan',
        patientEmail: 'alex@example.com',
        patientId: alexPatient._id,
        fileName: 'Blood_Test_Report_August.pdf',
        fileType: 'PDF',
        uploadDate: '2026-08-15',
        description: 'Complete blood count (CBC) and lipid profile report.'
      },
      {
        patientName: 'Alex Morgan',
        patientEmail: 'alex@example.com',
        patientId: alexPatient._id,
        fileName: 'ECG_Heart_Graph.jpg',
        fileType: 'JPG',
        uploadDate: '2026-08-18',
        description: 'Resting ECG 12-lead heart graph.'
      },
      {
        patientName: 'Robert Sterling',
        patientEmail: 'robert@example.com',
        patientId: robertPatient._id,
        fileName: 'Knee_XRay_Scan.png',
        fileType: 'PNG',
        uploadDate: '2026-08-10',
        description: 'Digital X-Ray scan of right knee joint.'
      }
    ]);

    console.log('✅ Database successfully seeded with initial test data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
