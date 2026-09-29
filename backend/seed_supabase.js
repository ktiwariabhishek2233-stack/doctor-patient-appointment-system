import { getSupabaseClient } from './config/supabase.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const client = getSupabaseClient();

if (!client) {
  console.error('❌ Cannot seed: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
  process.exit(1);
}

const seedSupabaseData = async () => {
  try {
    console.log('🌱 Starting Supabase database seeding...');

    // 1. Clear existing rows safely
    await client.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('medical_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('available_slots').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('doctors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await client.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('🧹 Cleared existing tables.');

    // Pre-hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Create Patient 1: Alex Morgan
    const { data: uAlex } = await client.from('users').insert([{
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: hashedPassword,
      role: 'patient'
    }]).select().single();

    const { data: pAlex } = await client.from('patients').insert([{
      user_id: uAlex.id,
      name: 'Alex Morgan',
      email: 'alex@example.com',
      age: 30,
      gender: 'Female',
      address: '123 Main Street, Cityville',
      phone: '555-0199'
    }]).select().single();

    // Create Patient 2: Robert Sterling
    const { data: uRobert } = await client.from('users').insert([{
      name: 'Robert Sterling',
      email: 'robert@example.com',
      password: hashedPassword,
      role: 'patient'
    }]).select().single();

    const { data: pRobert } = await client.from('patients').insert([{
      user_id: uRobert.id,
      name: 'Robert Sterling',
      email: 'robert@example.com',
      age: 45,
      gender: 'Male',
      address: '456 Oak Avenue, Metropolis',
      phone: '555-0188'
    }]).select().single();

    // 3. Create Doctors & Slots
    const doctorsSeed = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'sarah@mediconnect.org',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: '10 Years',
        about: 'Specialist in heart health, blood pressure management, and cardiovascular diagnostics.',
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus@mediconnect.org',
        specialization: 'Neurologist',
        qualification: 'MBBS, MD (Neurology)',
        experience: '12 Years',
        about: 'Expert in neurological disorders, migraine treatments, and brain health.',
        slots: ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM']
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena@mediconnect.org',
        specialization: 'Pediatrician',
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        experience: '8 Years',
        about: 'Specialist in child health, vaccinations, and infant care.',
        slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM']
      },
      {
        name: 'Dr. Jonathan Reyes',
        email: 'jonathan@mediconnect.org',
        specialization: 'Dermatologist',
        qualification: 'MBBS, MD (Dermatology)',
        experience: '9 Years',
        about: 'Expert in skin allergies, hair treatments, and cosmetic skincare.',
        slots: ['09:00 AM', '12:00 PM', '02:00 PM', '04:30 PM']
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael@mediconnect.org',
        specialization: 'Orthopedic',
        qualification: 'MBBS, MS (Orthopedics)',
        experience: '15 Years',
        about: 'Senior orthopedic surgeon focusing on sports injuries and joint recovery.',
        slots: ['09:30 AM', '10:30 AM', '01:00 PM', '03:30 PM']
      }
    ];

    const doctorMap = {};

    for (const d of doctorsSeed) {
      const { data: uDoc } = await client.from('users').insert([{
        name: d.name,
        email: d.email,
        password: hashedPassword,
        role: 'doctor'
      }]).select().single();

      const { data: docRecord } = await client.from('doctors').insert([{
        user_id: uDoc.id,
        name: d.name,
        email: d.email,
        specialization: d.specialization,
        qualification: d.qualification,
        experience: d.experience,
        about: d.about
      }]).select().single();

      doctorMap[d.email] = docRecord;

      const slotRows = d.slots.map(time => ({
        doctor_id: docRecord.id,
        time,
        status: (time === '11:00 AM' || time === '01:30 PM') ? 'Booked' : 'Available',
        date: ''
      }));

      await client.from('available_slots').insert(slotRows);
    }

    // 4. Initial Appointments
    const docSarah = doctorMap['sarah@mediconnect.org'];
    const docMarcus = doctorMap['marcus@mediconnect.org'];
    const docChen = doctorMap['michael@mediconnect.org'];

    await client.from('appointments').insert([
      {
        patient_id: pAlex.id,
        doctor_id: docSarah.id,
        patient_name: 'Alex Morgan',
        patient_email: 'alex@example.com',
        patient_age: 30,
        patient_gender: 'Female',
        patient_address: '123 Main Street, Cityville',
        doctor_name: docSarah.name,
        specialization: docSarah.specialization,
        date: '2026-08-25',
        time: '11:00 AM',
        reason: 'Chest pain and routine heart checkup.',
        status: 'ACCEPTED'
      },
      {
        patient_id: pRobert.id,
        doctor_id: docSarah.id,
        patient_name: 'Robert Sterling',
        patient_email: 'robert@example.com',
        patient_age: 45,
        patient_gender: 'Male',
        patient_address: '456 Oak Avenue, Metropolis',
        doctor_name: docSarah.name,
        specialization: docSarah.specialization,
        date: '2026-08-26',
        time: '02:00 PM',
        reason: 'High blood pressure consultation.',
        status: 'PENDING'
      },
      {
        patient_id: pAlex.id,
        doctor_id: docMarcus.id,
        patient_name: 'Alex Morgan',
        patient_email: 'alex@example.com',
        patient_age: 30,
        patient_gender: 'Female',
        patient_address: '123 Main Street, Cityville',
        doctor_name: docMarcus.name,
        specialization: docMarcus.specialization,
        date: '2026-08-27',
        time: '09:30 AM',
        reason: 'Severe migraine and headache symptoms.',
        status: 'PENDING'
      },
      {
        patient_id: pRobert.id,
        doctor_id: docChen.id,
        patient_name: 'Robert Sterling',
        patient_email: 'robert@example.com',
        patient_age: 45,
        patient_gender: 'Male',
        patient_address: '456 Oak Avenue, Metropolis',
        doctor_name: docChen.name,
        specialization: docChen.specialization,
        date: '2026-08-15',
        time: '10:30 AM',
        reason: 'Right knee joint sprain.',
        status: 'COMPLETED'
      }
    ]);

    // 5. Initial Medical Reports
    await client.from('medical_reports').insert([
      {
        patient_id: pAlex.id,
        patient_name: 'Alex Morgan',
        patient_email: 'alex@example.com',
        file_name: 'Blood_Test_Report_August.pdf',
        file_type: 'PDF',
        upload_date: '2026-08-15',
        description: 'Complete blood count (CBC) and lipid profile report.',
        file_path: 'alex_example_com/sample_blood_test.pdf',
        file_url: 'https://via.placeholder.com/600x400.png?text=Blood+Test+Report'
      },
      {
        patient_id: pAlex.id,
        patient_name: 'Alex Morgan',
        patient_email: 'alex@example.com',
        file_name: 'ECG_Heart_Graph.jpg',
        file_type: 'JPG',
        upload_date: '2026-08-18',
        description: 'Resting ECG 12-lead heart graph.',
        file_path: 'alex_example_com/sample_ecg.jpg',
        file_url: 'https://via.placeholder.com/600x400.png?text=ECG+Heart+Graph'
      },
      {
        patient_id: pRobert.id,
        patient_name: 'Robert Sterling',
        patient_email: 'robert@example.com',
        file_name: 'Knee_XRay_Scan.png',
        file_type: 'PNG',
        upload_date: '2026-08-10',
        description: 'Digital X-Ray scan of right knee joint.',
        file_path: 'robert_example_com/sample_xray.png',
        file_url: 'https://via.placeholder.com/600x400.png?text=Knee+X-Ray+Scan'
      }
    ]);

    console.log('✅ Supabase database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedSupabaseData();
