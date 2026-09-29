import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create configured axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication APIs
export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};


// Doctors APIs
export const getDoctors = async () => {
  const response = await api.get('/doctors');
  return response.data;
};

export const getDoctorById = async (id) => {
  const response = await api.get(`/doctors/${id}`);
  return response.data;
};

export const addDoctorSlot = async (doctorId, slotData) => {
  const response = await api.post(`/doctors/${doctorId}/slots`, slotData);
  return response.data;
};

// Slots APIs
export const deleteSlot = async (slotId) => {
  const response = await api.delete(`/slots/${slotId}`);
  return response.data;
};

// Appointments APIs
export const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export const getAppointments = async (params = {}) => {
  const response = await api.get('/appointments', { params });
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}`, { status });
  return response.data;
};

// Reports APIs
export const uploadMedicalReport = async (formData) => {
  const response = await api.post('/reports', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getMedicalReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

// Profiles APIs
export const updatePatientProfile = async (id, data) => {
  const response = await api.put(`/patients/${id}`, data);
  return response.data;
};

export const updateDoctorProfile = async (id, data) => {
  const response = await api.put(`/doctors/${id}`, data);
  return response.data;
};
