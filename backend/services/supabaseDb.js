import { getSupabaseClient } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

// Helper to get active client
const getClient = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  return client;
};

// ==============================================================================
// 1. AUTHENTICATION & USERS
// ==============================================================================

export const findUserByEmail = async (email) => {
  const client = getClient();
  const cleanEmail = email?.trim().toLowerCase();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const findUserById = async (id) => {
  const client = getClient();
  const { data, error } = await client
    .from('users')
    .select('id, name, email, role, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createUserWithProfile = async (userData) => {
  const client = getClient();
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
  } = userData;

  const cleanEmail = email.trim().toLowerCase();

  // 1. Hash password with bcrypt before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 2. Insert into users table
  const { data: newUser, error: userError } = await client
    .from('users')
    .insert([
      {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role
      }
    ])
    .select('id, name, email, role, created_at')
    .single();

  if (userError) throw userError;

  // 3. Create role-specific record
  if (role === 'doctor') {
    const docName = name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`;
    const expStr = experience?.toLowerCase().includes('year') ? experience : `${experience || '1'} Years`;

    const { data: newDoc, error: docError } = await client
      .from('doctors')
      .insert([
        {
          user_id: newUser.id,
          name: docName,
          email: cleanEmail,
          specialization: specialization || 'General Physician',
          qualification: qualification || 'MBBS',
          experience: expStr,
          about: about || `Specialist in ${specialization || 'General Medicine'} with ${expStr} experience.`
        }
      ])
      .select('id')
      .single();

    if (docError) throw docError;

    // Create default starter slots for newly registered doctor
    const defaultTimes = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    const slotRows = defaultTimes.map((time) => ({
      doctor_id: newDoc.id,
      time,
      status: 'Available',
      date: ''
    }));

    await client.from('available_slots').insert(slotRows);
  } else {
    // Patient profile
    const { error: patError } = await client
      .from('patients')
      .insert([
        {
          user_id: newUser.id,
          name: name.trim(),
          email: cleanEmail,
          age: Number(age) || 30,
          gender: gender || 'Male',
          address: address || '',
          phone: phone || '555-0199'
        }
      ]);

    if (patError) throw patError;
  }

  return formatUserResponse(newUser);
};

export const verifyPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

export const formatUserResponse = async (user) => {
  const client = getClient();
  let extra = {};

  if (user.role === 'doctor') {
    const { data: doc } = await client
      .from('doctors')
      .select('id, specialization, qualification, experience, about')
      .eq('user_id', user.id)
      .maybeSingle();

    if (doc) {
      extra = {
        doctorId: doc.id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        experience: doc.experience,
        about: doc.about
      };
    }
  } else if (user.role === 'patient') {
    const { data: pat } = await client
      .from('patients')
      .select('id, age, gender, address, phone')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pat) {
      extra = {
        patientId: pat.id,
        age: pat.age,
        gender: pat.gender,
        address: pat.address,
        phone: pat.phone
      };
    }
  }

  return {
    id: user.id,
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...extra
  };
};

// ==============================================================================
// 2. DOCTORS & SLOTS
// ==============================================================================

export const getAllDoctors = async () => {
  const client = getClient();
  const { data: doctors, error } = await client
    .from('doctors')
    .select('*, available_slots(*)');

  if (error) throw error;

  return (doctors || []).map((doc) => ({
    id: doc.id,
    _id: doc.id,
    name: doc.name,
    email: doc.email,
    specialization: doc.specialization,
    qualification: doc.qualification,
    experience: doc.experience,
    about: doc.about,
    slots: (doc.available_slots || []).map((s) => ({
      id: s.id,
      _id: s.id,
      time: s.time,
      status: s.status,
      date: s.date
    }))
  }));
};

export const getDoctorById = async (id) => {
  const client = getClient();
  // Check by doctor id or user_id
  let { data: doc, error } = await client
    .from('doctors')
    .select('*, available_slots(*)')
    .eq('id', id)
    .maybeSingle();

  if (!doc) {
    const res = await client
      .from('doctors')
      .select('*, available_slots(*)')
      .eq('user_id', id)
      .maybeSingle();
    doc = res.data;
  }

  if (!doc) return null;

  return {
    id: doc.id,
    _id: doc.id,
    name: doc.name,
    email: doc.email,
    specialization: doc.specialization,
    qualification: doc.qualification,
    experience: doc.experience,
    about: doc.about,
    slots: (doc.available_slots || []).map((s) => ({
      id: s.id,
      _id: s.id,
      time: s.time,
      status: s.status,
      date: s.date
    }))
  };
};

export const addDoctorSlot = async (doctorId, { time, date }) => {
  const client = getClient();

  // Find actual doctor
  let doc = await getDoctorById(doctorId);
  if (!doc) throw new Error('Doctor not found');

  // Check for existing slot
  const { data: existingSlot } = await client
    .from('available_slots')
    .select('id')
    .eq('doctor_id', doc.id)
    .eq('time', time.trim())
    .maybeSingle();

  if (existingSlot) {
    const err = new Error(`Slot for ${time} already exists`);
    err.statusCode = 400;
    throw err;
  }

  const { data: newSlot, error } = await client
    .from('available_slots')
    .insert([
      {
        doctor_id: doc.id,
        time: time.trim(),
        date: date || '',
        status: 'Available'
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: newSlot.id,
    _id: newSlot.id,
    doctorId: newSlot.doctor_id,
    time: newSlot.time,
    date: newSlot.date,
    status: newSlot.status
  };
};

export const deleteSlot = async (slotId) => {
  const client = getClient();
  const { data: slot, error: fetchErr } = await client
    .from('available_slots')
    .select('*')
    .eq('id', slotId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!slot) return null;

  if (slot.status === 'Booked') {
    const err = new Error('Cannot delete a booked slot');
    err.statusCode = 400;
    throw err;
  }

  const { error: delErr } = await client
    .from('available_slots')
    .delete()
    .eq('id', slotId);

  if (delErr) throw delErr;
  return slotId;
};

export const updateDoctorProfile = async (id, data) => {
  const client = getClient();
  let doc = await getDoctorById(id);
  if (!doc) return null;

  const updateFields = {};
  if (data.name) updateFields.name = data.name.trim();
  if (data.email) updateFields.email = data.email.trim().toLowerCase();
  if (data.specialization) updateFields.specialization = data.specialization.trim();
  if (data.qualification) updateFields.qualification = data.qualification.trim();
  if (data.experience) updateFields.experience = data.experience.trim();
  if (data.about !== undefined) updateFields.about = data.about;

  const { data: updatedDoc, error } = await client
    .from('doctors')
    .update(updateFields)
    .eq('id', doc.id)
    .select()
    .single();

  if (error) throw error;

  // Sync parent user
  if (updatedDoc.user_id && (data.name || data.email)) {
    await client
      .from('users')
      .update({
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.trim().toLowerCase() })
      })
      .eq('id', updatedDoc.user_id);
  }

  return {
    id: updatedDoc.id,
    _id: updatedDoc.id,
    name: updatedDoc.name,
    email: updatedDoc.email,
    specialization: updatedDoc.specialization,
    qualification: updatedDoc.qualification,
    experience: updatedDoc.experience,
    about: updatedDoc.about
  };
};

// ==============================================================================
// 3. APPOINTMENTS (Atomic Double-Booking Prevention)
// ==============================================================================

export const bookAppointment = async (appointmentData) => {
  const client = getClient();
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
  } = appointmentData;

  // Resolve Doctor
  let doc = await getDoctorById(doctorId);
  if (!doc && doctorName) {
    const { data: d } = await client
      .from('doctors')
      .select('*')
      .ilike('name', `%${doctorName}%`)
      .maybeSingle();
    doc = d;
  }

  const actualDoctorId = doc ? doc.id : doctorId;
  const actualDoctorName = doc ? doc.name : (doctorName || 'Doctor');
  const actualSpec = doc ? doc.specialization : (specialization || 'General Physician');

  // 1. Double-booking check: active appointments (PENDING or ACCEPTED)
  const { data: existingApt } = await client
    .from('appointments')
    .select('id')
    .eq('doctor_id', actualDoctorId)
    .eq('date', date.trim())
    .eq('time', time.trim())
    .in('status', ['PENDING', 'ACCEPTED'])
    .maybeSingle();

  if (existingApt) {
    const err = new Error(`This slot (${time} on ${date}) is already booked. Please choose another slot.`);
    err.statusCode = 400;
    throw err;
  }

  // 2. Mark slot booked in available_slots
  const { data: slot } = await client
    .from('available_slots')
    .select('*')
    .eq('doctor_id', actualDoctorId)
    .eq('time', time.trim())
    .maybeSingle();

  if (slot) {
    if (slot.status === 'Booked') {
      const err = new Error(`Slot ${time} is already marked as Booked.`);
      err.statusCode = 400;
      throw err;
    }
    await client
      .from('available_slots')
      .update({ status: 'Booked' })
      .eq('id', slot.id);
  } else {
    await client
      .from('available_slots')
      .insert([
        {
          doctor_id: actualDoctorId,
          time: time.trim(),
          date: date.trim(),
          status: 'Booked'
        }
      ]);
  }

  // 3. Insert Appointment record
  const { data: appointment, error } = await client
    .from('appointments')
    .insert([
      {
        patient_id: patientId || null,
        doctor_id: actualDoctorId,
        patient_name: patientName || 'Patient',
        patient_email: patientEmail.trim().toLowerCase(),
        patient_age: Number(patientAge) || 30,
        patient_gender: patientGender || 'Female',
        patient_address: patientAddress || '',
        doctor_name: actualDoctorName,
        specialization: actualSpec,
        date: date.trim(),
        time: time.trim(),
        reason: reason || 'General medical consultation',
        status: 'PENDING'
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: appointment.id,
    _id: appointment.id,
    patientName: appointment.patient_name,
    patientAge: appointment.patient_age,
    patientGender: appointment.patient_gender,
    patientAddress: appointment.patient_address,
    patientEmail: appointment.patient_email,
    patientId: appointment.patient_id,
    doctorId: appointment.doctor_id,
    doctorName: appointment.doctor_name,
    specialization: appointment.specialization,
    date: appointment.date,
    time: appointment.time,
    reason: appointment.reason,
    status: appointment.status,
    createdAt: appointment.created_at
  };
};

export const getAppointments = async (filters = {}) => {
  const client = getClient();
  let query = client
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.patientEmail) {
    query = query.eq('patient_email', filters.patientEmail.trim().toLowerCase());
  }
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.doctorId) {
    query = query.eq('doctor_id', filters.doctorId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status.toUpperCase());
  }

  const { data: appointments, error } = await query;
  if (error) throw error;

  return (appointments || []).map((apt) => ({
    id: apt.id,
    _id: apt.id,
    patientName: apt.patient_name,
    patientAge: apt.patient_age,
    patientGender: apt.patient_gender,
    patientAddress: apt.patient_address,
    patientEmail: apt.patient_email,
    patientId: apt.patient_id,
    doctorId: apt.doctor_id,
    doctorName: apt.doctor_name,
    specialization: apt.specialization,
    date: apt.date,
    time: apt.time,
    reason: apt.reason,
    status: apt.status,
    createdAt: apt.created_at
  }));
};

export const updateAppointmentStatus = async (id, status) => {
  const client = getClient();
  const validStatus = status?.toUpperCase();

  const { data: apt, error: fetchErr } = await client
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!apt) return null;

  const { data: updatedApt, error: updateErr } = await client
    .from('appointments')
    .update({ status: validStatus })
    .eq('id', id)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // If REJECTED, release slot back to 'Available'
  if (validStatus === 'REJECTED') {
    await client
      .from('available_slots')
      .update({ status: 'Available' })
      .eq('doctor_id', apt.doctor_id)
      .eq('time', apt.time);
  }

  return {
    id: updatedApt.id,
    _id: updatedApt.id,
    patientName: updatedApt.patient_name,
    patientAge: updatedApt.patient_age,
    patientGender: updatedApt.patient_gender,
    patientAddress: updatedApt.patient_address,
    patientEmail: updatedApt.patient_email,
    doctorId: updatedApt.doctor_id,
    doctorName: updatedApt.doctor_name,
    specialization: updatedApt.specialization,
    date: updatedApt.date,
    time: updatedApt.time,
    reason: updatedApt.reason,
    status: updatedApt.status
  };
};

// ==============================================================================
// 4. MEDICAL REPORTS (Private Storage & Signed URLs)
// ==============================================================================

export const uploadReportToPrivateStorage = async (fileBuffer, fileName, mimeType, patientEmail) => {
  const client = getClient();
  const cleanEmail = patientEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${cleanEmail}/${Date.now()}_${safeName}`;

  // Upload to private bucket 'medical-reports'
  const { data, error } = await client.storage
    .from('medical-reports')
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw error;
  }

  // Generate a secure signed URL valid for 24 hours (86400 seconds)
  const { data: signedData, error: signErr } = await client.storage
    .from('medical-reports')
    .createSignedUrl(storagePath, 86400);

  const signedUrl = signedData ? signedData.signedUrl : '';
  return { storagePath, signedUrl };
};

export const createMedicalReportRecord = async (reportData) => {
  const client = getClient();
  const {
    patientName,
    patientEmail,
    patientId,
    fileName,
    fileType,
    uploadDate,
    description,
    filePath,
    fileUrl
  } = reportData;

  const { data: report, error } = await client
    .from('medical_reports')
    .insert([
      {
        patient_id: patientId || null,
        patient_name: patientName || 'Patient',
        patient_email: patientEmail ? patientEmail.trim().toLowerCase() : '',
        file_name: fileName || 'Medical_Report.pdf',
        file_type: fileType || 'PDF',
        upload_date: uploadDate || new Date().toISOString().split('T')[0],
        description: description || 'Uploaded medical report',
        file_path: filePath || '',
        file_url: fileUrl || ''
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: report.id,
    _id: report.id,
    patientName: report.patient_name,
    patientEmail: report.patient_email,
    fileName: report.file_name,
    fileType: report.file_type,
    uploadDate: report.upload_date,
    description: report.description,
    fileUrl: report.file_url
  };
};

export const getMedicalReports = async (filters = {}) => {
  const client = getClient();
  let query = client
    .from('medical_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.patientEmail) {
    query = query.eq('patient_email', filters.patientEmail.trim().toLowerCase());
  }
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.patientName) {
    query = query.ilike('patient_name', `%${filters.patientName}%`);
  }

  const { data: reports, error } = await query;
  if (error) throw error;

  // Refresh signed URLs if using private storage path
  const enriched = await Promise.all(
    (reports || []).map(async (r) => {
      let activeUrl = r.file_url;
      if (r.file_path && !activeUrl.startsWith('http')) {
        const { data: signed } = await client.storage
          .from('medical-reports')
          .createSignedUrl(r.file_path, 86400);
        if (signed?.signedUrl) activeUrl = signed.signedUrl;
      }
      return {
        id: r.id,
        _id: r.id,
        patientName: r.patient_name,
        patientEmail: r.patient_email,
        fileName: r.file_name,
        fileType: r.file_type,
        uploadDate: r.upload_date,
        description: r.description,
        fileUrl: activeUrl
      };
    })
  );

  return enriched;
};

// ==============================================================================
// 5. PATIENT PROFILES
// ==============================================================================

export const getAllPatients = async () => {
  const client = getClient();
  const { data: patients, error } = await client.from('patients').select('*');
  if (error) throw error;

  return (patients || []).map((p) => ({
    id: p.id,
    _id: p.id,
    name: p.name,
    email: p.email,
    age: p.age,
    gender: p.gender,
    address: p.address,
    phone: p.phone
  }));
};

export const getPatientById = async (id) => {
  const client = getClient();
  let { data: patient } = await client
    .from('patients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!patient) {
    const res = await client
      .from('patients')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();
    patient = res.data;
  }

  if (!patient) return null;

  return {
    id: patient.id,
    _id: patient.id,
    name: patient.name,
    email: patient.email,
    age: patient.age,
    gender: patient.gender,
    address: patient.address,
    phone: patient.phone
  };
};

export const updatePatientProfile = async (id, data) => {
  const client = getClient();
  const patient = await getPatientById(id);
  if (!patient) return null;

  const updateFields = {};
  if (data.name) updateFields.name = data.name.trim();
  if (data.email) updateFields.email = data.email.trim().toLowerCase();
  if (data.age !== undefined) updateFields.age = Number(data.age);
  if (data.gender) updateFields.gender = data.gender;
  if (data.address !== undefined) updateFields.address = data.address;
  if (data.phone) updateFields.phone = data.phone;

  const { data: updatedPat, error } = await client
    .from('patients')
    .update(updateFields)
    .eq('id', patient.id)
    .select()
    .single();

  if (error) throw error;

  if (updatedPat.user_id && (data.name || data.email)) {
    await client
      .from('users')
      .update({
        ...(data.name && { name: data.name.trim() }),
        ...(data.email && { email: data.email.trim().toLowerCase() })
      })
      .eq('id', updatedPat.user_id);
  }

  return {
    id: updatedPat.id,
    _id: updatedPat.id,
    name: updatedPat.name,
    email: updatedPat.email,
    age: updatedPat.age,
    gender: updatedPat.gender,
    address: updatedPat.address,
    phone: updatedPat.phone
  };
};
