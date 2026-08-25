import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Patient from './pages/Patient';
import Doctor from './pages/Doctor';
import {
  initialDoctors,
  initialAppointments,
  initialMedicalReports
} from './data/data';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mediconnect_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [doctors, setDoctors] = useState(initialDoctors);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [medicalReports, setMedicalReports] = useState(initialMedicalReports);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mediconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mediconnect_user');
    }
  }, [currentUser]);

  return (
    <Router>
      <div className="app-container">
        <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />

        <Routes>
          <Route
            path="/"
            element={
              <Landing
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          />

          <Route
            path="/auth"
            element={<Auth setCurrentUser={setCurrentUser} />}
          />

          <Route
            path="/patient"
            element={
              currentUser?.role === 'patient' ? (
                <Patient
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  doctors={doctors}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  medicalReports={medicalReports}
                  setMedicalReports={setMedicalReports}
                />
              ) : (
                <Navigate
                  to="/auth"
                  replace
                  state={{
                    role: 'patient',
                    message: 'Please login as a Patient to access the Patient Portal.'
                  }}
                />
              )
            }
          />

          <Route
            path="/doctor"
            element={
              currentUser?.role === 'doctor' ? (
                <Doctor
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  medicalReports={medicalReports}
                />
              ) : (
                <Navigate
                  to="/auth"
                  replace
                  state={{
                    role: 'doctor',
                    message: 'Please login as a Doctor to access the Doctor Workstation.'
                  }}
                />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
