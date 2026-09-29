import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Patient from './pages/Patient';
import Doctor from './pages/Doctor';
import { getDoctors, getAppointments, getMedicalReports, getCurrentUser } from './api/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);

  // Authenticate user on initial load using stored JWT token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mediconnect_token');
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res?.user) {
            setCurrentUser(res.user);
          } else {
            localStorage.removeItem('mediconnect_token');
            setCurrentUser(null);
          }
        } catch (e) {
          localStorage.removeItem('mediconnect_token');
          setCurrentUser(null);
        }
      }
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const refreshGlobalData = async () => {
    try {
      const [docsData, aptsData, repsData] = await Promise.all([
        getDoctors().catch(() => []),
        getAppointments().catch(() => []),
        getMedicalReports().catch(() => [])
      ]);
      if (docsData) setDoctors(docsData);
      if (aptsData) setAppointments(aptsData);
      if (repsData) setMedicalReports(repsData);
    } catch (err) {
      console.error('Error fetching global data:', err);
    }
  };

  useEffect(() => {
    refreshGlobalData();
  }, [currentUser]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0077b6', fontSize: '1.2rem', fontFamily: 'system-ui, sans-serif' }}>
        Loading MediConnect...
      </div>
    );
  }

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
