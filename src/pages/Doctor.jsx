import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { initialMedicalReports } from '../data/data';

export default function Doctor({ 
  currentUser, 
  setCurrentUser,
  appointments = [], 
  setAppointments,
  medicalReports = initialMedicalReports,
  initialTab = 'dashboard'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'dashboard' | 'slots' | 'requests' | 'reports' | 'profile'

  // Manage Slots State
  const [slotDate, setSlotDate] = useState('2026-08-28');
  const [slotTime, setSlotTime] = useState('09:00 AM');
  const [slotsList, setSlotsList] = useState([
    { id: 's1', time: '09:00 AM', status: 'Available' },
    { id: 's2', time: '10:00 AM', status: 'Available' },
    { id: 's3', time: '11:00 AM', status: 'Booked' },
    { id: 's4', time: '02:00 PM', status: 'Available' },
    { id: 's5', time: '04:00 PM', status: 'Booked' }
  ]);
  const [slotNotice, setSlotNotice] = useState('');

  // Doctor Profile State
  const [docName, setDocName] = useState(currentUser?.name || 'Dr. Sarah Jenkins');
  const [docEmail, setDocEmail] = useState(currentUser?.email || 'sarah@mediconnect.org');
  const [docSpec, setDocSpec] = useState(currentUser?.specialization || 'Cardiologist');
  const [docQual, setDocQual] = useState(currentUser?.qualification || 'MBBS, MD (Cardiology)');
  const [docExp, setDocExp] = useState(currentUser?.experience || '10 Years');
  const [docAbout, setDocAbout] = useState(
    'Specialist in heart health, blood pressure management, and cardiovascular diagnostics.'
  );
  const [profileSaved, setProfileSaved] = useState(false);

  // Selected Patient Details Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Statistics
  const totalAppointmentsCount = appointments.length;
  const pendingRequestsCount = appointments.filter(a => a.status === 'PENDING').length;
  const availableSlotsCount = slotsList.filter(s => s.status === 'Available').length;
  const totalPatientsCount = new Set(appointments.map(a => a.patientName)).size;

  // Accept Appointment (PENDING -> ACCEPTED)
  const handleAcceptAppointment = (aptId) => {
    setAppointments(appointments.map(a => 
      a.id === aptId ? { ...a, status: 'ACCEPTED' } : a
    ));
  };

  // Reject Appointment (PENDING -> REJECTED)
  const handleRejectAppointment = (aptId) => {
    setAppointments(appointments.map(a => 
      a.id === aptId ? { ...a, status: 'REJECTED' } : a
    ));
  };

  // Add Time Slot
  const handleAddSlot = (e) => {
    e.preventDefault();
    if (slotsList.some(s => s.time === slotTime)) {
      setSlotNotice(`Slot for ${slotTime} already exists.`);
      setTimeout(() => setSlotNotice(''), 2500);
      return;
    }

    const newSlot = {
      id: 's-' + Date.now(),
      time: slotTime,
      status: 'Available'
    };

    setSlotsList([...slotsList, newSlot]);
    setSlotNotice(`Slot for ${slotTime} added on ${slotDate}`);
    setTimeout(() => setSlotNotice(''), 2000);
  };

  // Delete Available Slot (Booked slots cannot be deleted)
  const handleDeleteSlot = (id) => {
    const slot = slotsList.find(s => s.id === id);
    if (slot?.status === 'Booked') return;
    setSlotsList(slotsList.filter(s => s.id !== id));
  };

  // Save Doctor Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (setCurrentUser) {
      setCurrentUser({
        ...currentUser,
        name: docName,
        email: docEmail,
        specialization: docSpec,
        qualification: docQual,
        experience: docExp,
        about: docAbout
      });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role="doctor" 
        setCurrentUser={setCurrentUser} 
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-title">
          <h2>Doctor Dashboard</h2>
          <p>Welcome, {docName} | {docSpec} Specialist</p>
        </div>

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stat Boxes */}
            <div className="grid-cards">
              <div className="stat-box">
                <p>Today's Appointments</p>
                <h3>{totalAppointmentsCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#f59e0b' }}>
                <p>Pending Requests</p>
                <h3 style={{ color: '#f59e0b' }}>{pendingRequestsCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#2b9348' }}>
                <p>Total Patients</p>
                <h3 style={{ color: '#2b9348' }}>{totalPatientsCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#0284c7' }}>
                <p>Available Slots</p>
                <h3 style={{ color: '#0284c7' }}>{availableSlotsCount}</h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Doctor Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('requests')} className="btn-primary">
                  📋 View Appointment Requests ({pendingRequestsCount})
                </button>
                <button onClick={() => setActiveTab('slots')} className="btn-secondary">
                  ⏰ Manage Available Slots
                </button>
                <button onClick={() => setActiveTab('reports')} className="btn-secondary">
                  📁 Patient Medical Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MANAGE SLOTS */}
        {activeTab === 'slots' && (
          <div>
            {/* Add Slot Form */}
            <div className="card" style={{ maxWidth: '550px' }}>
              <h3 style={{ color: '#0077b6', marginBottom: '12px' }}>Manage Available Slots</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '15px' }}>
                Select a date and add available consultation time slots for patients.
              </p>

              {slotNotice && (
                <div className="alert-message alert-success">{slotNotice}</div>
              )}

              <form onSubmit={handleAddSlot}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Date:</label>
                    <input 
                      type="date" 
                      value={slotDate} 
                      onChange={(e) => setSlotDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Select Time Slot:</label>
                    <select value={slotTime} onChange={(e) => setSlotTime(e.target.value)}>
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  + Add Time Slot
                </button>
              </form>
            </div>

            {/* Slots List Table */}
            <div className="card table-responsive">
              <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Available & Booked Slots</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slotsList.map((slot) => (
                    <tr key={slot.id}>
                      <td><strong>⏰ {slot.time}</strong></td>
                      <td>
                        <span className={`slot-badge ${slot.status === 'Available' ? 'slot-available' : 'slot-booked'}`}>
                          {slot.status}
                        </span>
                      </td>
                      <td>
                        {slot.status === 'Available' ? (
                          <button 
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)} 
                            className="btn-danger btn-sm"
                          >
                            Delete Slot
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Booked (Cannot be deleted)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. APPOINTMENT REQUESTS & HISTORY */}
        {activeTab === 'requests' && (
          <div className="card table-responsive">
            <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Appointment Requests & History</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        <strong>{apt.patientName}</strong>
                        <button 
                          type="button"
                          onClick={() => setSelectedPatient(apt)} 
                          style={{ display: 'block', background: 'none', border: 'none', color: '#0077b6', fontSize: '0.8rem', cursor: 'pointer', marginTop: '2px', fontWeight: 'bold' }}
                        >
                          View Details →
                        </button>
                      </td>
                      <td>{apt.patientAge || 30} Yrs</td>
                      <td>{apt.date} at {apt.time}</td>
                      <td>{apt.reason}</td>
                      <td>
                        <span className={`badge badge-${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        {apt.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              type="button"
                              onClick={() => handleAcceptAppointment(apt.id)} 
                              className="btn-success btn-sm"
                            >
                              Accept
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleRejectAppointment(apt.id)} 
                              className="btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            {apt.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                      No appointment requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. PATIENT MEDICAL REPORTS */}
        {activeTab === 'reports' && (
          <div className="card table-responsive">
            <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Patient Medical Reports</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Report Name</th>
                  <th>File Type</th>
                  <th>Upload Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {medicalReports.map((rep) => (
                  <tr key={rep.id}>
                    <td><strong>{rep.patientName}</strong></td>
                    <td>{rep.fileName}</td>
                    <td><span className="badge badge-completed">{rep.fileType}</span></td>
                    <td>{rep.uploadDate}</td>
                    <td>
                      <button 
                        type="button"
                        onClick={() => alert(`Viewing document: ${rep.fileName} for patient ${rep.patientName}`)} 
                        className="btn-secondary btn-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. DOCTOR PROFILE */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: '550px' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Doctor Profile</h3>

            {profileSaved && (
              <div className="alert-message alert-success">
                Doctor profile saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Name:</label>
                <input 
                  type="text" 
                  value={docName} 
                  onChange={(e) => setDocName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={docEmail} 
                  onChange={(e) => setDocEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Specialization:</label>
                <input 
                  type="text" 
                  value={docSpec} 
                  onChange={(e) => setDocSpec(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Qualification:</label>
                  <input 
                    type="text" 
                    value={docQual} 
                    onChange={(e) => setDocQual(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Experience:</label>
                  <input 
                    type="text" 
                    value={docExp} 
                    onChange={(e) => setDocExp(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>About:</label>
                <textarea 
                  rows="3" 
                  value={docAbout} 
                  onChange={(e) => setDocAbout(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* PATIENT INFORMATION MODAL */}
        {selectedPatient && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Patient Details</h3>
                <button onClick={() => setSelectedPatient(null)} className="close-btn">✕</button>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Patient Name:</strong> {selectedPatient.patientName}</p>
                <p><strong>Age:</strong> {selectedPatient.patientAge || 30} Years</p>
                <p><strong>Gender:</strong> {selectedPatient.patientGender || 'Female'}</p>
                <p><strong>Address:</strong> {selectedPatient.patientAddress || '123 Main Street, Cityville'}</p>
                <p><strong>Appointment Date & Time:</strong> {selectedPatient.date} at {selectedPatient.time}</p>
                <p><strong>Reason for Visit:</strong> {selectedPatient.reason}</p>
                <p><strong>Current Status:</strong> <span className={`badge badge-${selectedPatient.status.toLowerCase()}`}>{selectedPatient.status}</span></p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {selectedPatient.status === 'PENDING' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => {
                        handleAcceptAppointment(selectedPatient.id);
                        setSelectedPatient(null);
                      }} 
                      className="btn-success btn-sm"
                    >
                      Accept
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        handleRejectAppointment(selectedPatient.id);
                        setSelectedPatient(null);
                      }} 
                      className="btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  type="button"
                  onClick={() => setSelectedPatient(null)} 
                  className="btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
