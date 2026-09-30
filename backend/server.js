import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { isSupabaseConfigured } from './config/supabase.js';

import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import slotRoutes from './routes/slot.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import reportRoutes from './routes/report.routes.js';
import patientRoutes from './routes/patient.routes.js';
import profileRoutes from './routes/profile.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (isSupabaseConfigured()) {
  console.log('⚡ MediConnect is connected to Supabase PostgreSQL database.');
} else {
  console.log('ℹ️ Supabase not yet configured. Connecting to MongoDB fallback...');
  connectDB();
}

const app = express();

app.use(async (req, res, next) => {
  if (!isSupabaseConfigured()) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection error in request:', err);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🏥 MediConnect Backend API Server is running!',
    database: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'MongoDB (Local)',
    frontendUrl: 'http://localhost:3000',
    documentation: {
      healthCheck: '/api/health',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      reports: '/api/reports',
      auth: '/api/auth'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MediConnect API Server is running smoothly 🏥',
    database: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'MongoDB (Local)'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', profileRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || err.statusCode || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
