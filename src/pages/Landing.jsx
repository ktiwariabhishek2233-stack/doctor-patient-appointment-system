import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing({ currentUser }) {
  const navigate = useNavigate();

  const handleFindDoctor = () => {
    if (currentUser?.role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/auth', { state: { role: 'patient', message: 'Please login as a Patient to search doctors and book appointments.' } });
    }
  };

  const handleBookAppointment = () => {
    if (currentUser?.role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/auth', { state: { role: 'patient', message: 'Please login as a Patient to book an appointment.' } });
    }
  };

  const handleEnterPatient = () => {
    if (currentUser?.role === 'patient') {
      navigate('/patient');
    } else {
      navigate('/auth', { state: { role: 'patient', message: 'Please login as a Patient to access the Patient Portal.' } });
    }
  };

  const handleEnterDoctor = () => {
    if (currentUser?.role === 'doctor') {
      navigate('/doctor');
    } else {
      navigate('/auth', { state: { role: 'doctor', message: 'Please login as a Doctor to access the Doctor Workstation.' } });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="landing-hero">
        <h1>Doctor-Patient Appointment Management System</h1>
        <p>
          Find trusted doctors, check available appointment slots and manage your appointments easily.
        </p>
        <div className="hero-actions">
          <button onClick={handleFindDoctor} className="btn-primary">
            🔍 Find Doctor
          </button>
          <button onClick={handleBookAppointment} className="btn-secondary">
            📅 Book Appointment
          </button>
        </div>
      </div>

      {/* Core Features */}
      <div className="landing-features">
        <h2 className="section-heading">Key Features</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Find Doctors</h3>
            <p>Search doctors by name and specialization.</p>
          </div>

          <div className="feature-item">
            <h3>Easy Appointment Booking</h3>
            <p>View available slots and book an appointment easily.</p>
          </div>

          <div className="feature-item">
            <h3>Medical Reports</h3>
            <p>Upload and view medical reports such as PDF, JPG and PNG files.</p>
          </div>

          <div className="feature-item">
            <h3>Appointment History</h3>
            <p>View your appointments and their current status.</p>
          </div>
        </div>

        {/* Roles Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '10px' }}>Patient Portal</h3>
            <p style={{ marginBottom: '15px' }}>
              Search doctors, view available slots, book appointments, and upload medical reports.
            </p>
            <button onClick={handleEnterPatient} className="btn-primary">
              Enter as Patient
            </button>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '10px' }}>Doctor Portal</h3>
            <p style={{ marginBottom: '15px' }}>
              Manage available slots, view appointment requests, and accept or reject appointments.
            </p>
            <button onClick={handleEnterDoctor} className="btn-secondary">
              Enter as Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="footer">
        <p>© 2026 MediConnect — Doctor-Patient Appointment Management System</p>
      </footer>
    </div>
  );
}
