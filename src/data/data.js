// Simple dummy data for Doctor-Patient Appointment Management System

export const initialDoctors = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    email: "sarah@mediconnect.org",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experience: "10 Years",
    about: "Specialist in heart health, blood pressure management, and cardiovascular diagnostics.",
    slots: [
      { id: "s1", time: "09:00 AM", status: "Available" },
      { id: "s2", time: "10:00 AM", status: "Available" },
      { id: "s3", time: "11:00 AM", status: "Booked" },
      { id: "s4", time: "02:00 PM", status: "Available" },
      { id: "s5", time: "04:00 PM", status: "Booked" }
    ]
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    email: "marcus@mediconnect.org",
    specialization: "Neurologist",
    qualification: "MBBS, MD (Neurology)",
    experience: "12 Years",
    about: "Expert in neurological disorders, migraine treatments, and brain health.",
    slots: [
      { id: "s6", time: "09:30 AM", status: "Available" },
      { id: "s7", time: "11:00 AM", status: "Available" },
      { id: "s8", time: "01:30 PM", status: "Booked" },
      { id: "s9", time: "03:00 PM", status: "Available" }
    ]
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    email: "elena@mediconnect.org",
    specialization: "Pediatrician",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experience: "8 Years",
    about: "Specialist in child health, vaccinations, and infant care.",
    slots: [
      { id: "s10", time: "10:00 AM", status: "Available" },
      { id: "s11", time: "11:30 AM", status: "Available" },
      { id: "s12", time: "02:30 PM", status: "Available" },
      { id: "s13", time: "04:30 PM", status: "Booked" }
    ]
  },
  {
    id: "doc-4",
    name: "Dr. Jonathan Reyes",
    email: "jonathan@mediconnect.org",
    specialization: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    experience: "9 Years",
    about: "Expert in skin allergies, hair treatments, and cosmetic skincare.",
    slots: [
      { id: "s14", time: "09:00 AM", status: "Available" },
      { id: "s15", time: "12:00 PM", status: "Booked" },
      { id: "s16", time: "02:00 PM", status: "Available" },
      { id: "s17", time: "04:30 PM", status: "Available" }
    ]
  },
  {
    id: "doc-5",
    name: "Dr. Michael Chen",
    email: "michael@mediconnect.org",
    specialization: "Orthopedic",
    qualification: "MBBS, MS (Orthopedics)",
    experience: "11 Years",
    about: "Specialist in bone fractures, joint pain, spine care, and arthritis.",
    slots: [
      { id: "s18", time: "08:30 AM", status: "Available" },
      { id: "s19", time: "10:30 AM", status: "Booked" },
      { id: "s20", time: "01:00 PM", status: "Available" },
      { id: "s21", time: "03:30 PM", status: "Available" }
    ]
  },
  {
    id: "doc-6",
    name: "Dr. Emily Watson",
    email: "emily@mediconnect.org",
    specialization: "General Physician",
    qualification: "MBBS, MD (General Medicine)",
    experience: "7 Years",
    about: "Provides primary health checkups, fever care, and chronic disease management.",
    slots: [
      { id: "s22", time: "09:00 AM", status: "Available" },
      { id: "s23", time: "10:00 AM", status: "Available" },
      { id: "s24", time: "11:30 AM", status: "Available" },
      { id: "s25", time: "03:00 PM", status: "Booked" },
      { id: "s26", time: "05:00 PM", status: "Available" }
    ]
  }
];

export const initialUsers = [
  {
    id: "pat-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    password: "password123",
    role: "patient",
    age: 30,
    gender: "Female",
    address: "123 Main Street, Cityville",
    phone: "555-0199"
  },
  {
    id: "pat-2",
    name: "Robert Sterling",
    email: "robert@example.com",
    password: "password123",
    role: "patient",
    age: 45,
    gender: "Male",
    address: "456 Oak Avenue, Metropolis",
    phone: "555-0188"
  },
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    email: "sarah@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology)",
    experience: "10 Years",
    about: "Specialist in heart health, blood pressure management, and cardiovascular diagnostics."
  },
  {
    id: "doc-2",
    name: "Dr. Marcus Vance",
    email: "marcus@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "Neurologist",
    qualification: "MBBS, MD (Neurology)",
    experience: "12 Years",
    about: "Expert in neurological disorders, migraine treatments, and brain health."
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    email: "elena@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "Pediatrician",
    qualification: "MBBS, DCH, MD (Pediatrics)",
    experience: "8 Years",
    about: "Specialist in child health, vaccinations, and infant care."
  },
  {
    id: "doc-4",
    name: "Dr. Jonathan Reyes",
    email: "jonathan@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    experience: "9 Years",
    about: "Expert in skin allergies, hair treatments, and cosmetic skincare."
  },
  {
    id: "doc-5",
    name: "Dr. Michael Chen",
    email: "michael@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "Orthopedic",
    qualification: "MBBS, MS (Orthopedics)",
    experience: "11 Years",
    about: "Specialist in bone fractures, joint pain, spine care, and arthritis."
  },
  {
    id: "doc-6",
    name: "Dr. Emily Watson",
    email: "emily@mediconnect.org",
    password: "password123",
    role: "doctor",
    specialization: "General Physician",
    qualification: "MBBS, MD (General Medicine)",
    experience: "7 Years",
    about: "Provides primary health checkups, fever care, and chronic disease management."
  }
];

export const initialPatients = [
  {
    id: "pat-1",
    name: "Alex Morgan",
    email: "alex@example.com",
    age: 30,
    gender: "Female",
    address: "123 Main Street, Cityville",
    phone: "555-0199"
  },
  {
    id: "pat-2",
    name: "Robert Sterling",
    email: "robert@example.com",
    age: 45,
    gender: "Male",
    address: "456 Oak Avenue, Metropolis",
    phone: "555-0188"
  }
];

export const initialAppointments = [
  {
    id: "apt-1",
    patientName: "Alex Morgan",
    patientAge: 30,
    patientGender: "Female",
    patientAddress: "123 Main Street, Cityville",
    patientEmail: "alex@example.com",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Jenkins",
    specialization: "Cardiologist",
    date: "2026-08-25",
    time: "11:00 AM",
    reason: "Chest pain and routine heart checkup.",
    status: "ACCEPTED"
  },
  {
    id: "apt-2",
    patientName: "Robert Sterling",
    patientAge: 45,
    patientGender: "Male",
    patientAddress: "456 Oak Avenue, Metropolis",
    patientEmail: "robert@example.com",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Jenkins",
    specialization: "Cardiologist",
    date: "2026-08-26",
    time: "02:00 PM",
    reason: "High blood pressure consultation.",
    status: "PENDING"
  },
  {
    id: "apt-3",
    patientName: "Alex Morgan",
    patientAge: 30,
    patientGender: "Female",
    patientAddress: "123 Main Street, Cityville",
    patientEmail: "alex@example.com",
    doctorId: "doc-2",
    doctorName: "Dr. Marcus Vance",
    specialization: "Neurologist",
    date: "2026-08-27",
    time: "09:30 AM",
    reason: "Severe migraine and headache symptoms.",
    status: "PENDING"
  },
  {
    id: "apt-4",
    patientName: "Robert Sterling",
    patientAge: 45,
    patientGender: "Male",
    patientAddress: "456 Oak Avenue, Metropolis",
    patientEmail: "robert@example.com",
    doctorId: "doc-5",
    doctorName: "Dr. Michael Chen",
    specialization: "Orthopedic",
    date: "2026-08-15",
    time: "10:30 AM",
    reason: "Right knee joint sprain.",
    status: "COMPLETED"
  }
];

export const initialMedicalReports = [
  {
    id: "rep-1",
    patientName: "Alex Morgan",
    fileName: "Blood_Test_Report_August.pdf",
    fileType: "PDF",
    uploadDate: "2026-08-15",
    description: "Complete blood count (CBC) and lipid profile report."
  },
  {
    id: "rep-2",
    patientName: "Alex Morgan",
    fileName: "ECG_Heart_Graph.jpg",
    fileType: "JPG",
    uploadDate: "2026-08-18",
    description: "Resting ECG 12-lead heart graph."
  },
  {
    id: "rep-3",
    patientName: "Robert Sterling",
    fileName: "Knee_XRay_Scan.png",
    fileType: "PNG",
    uploadDate: "2026-08-10",
    description: "Digital X-Ray scan of right knee joint."
  }
];
