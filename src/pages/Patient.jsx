import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { initialDoctors } from '../data/data';

export default function Patient({ 
  currentUser, 
  setCurrentUser,
  appointments = [], 
  setAppointments,
  medicalReports = [], 
  setMedicalReports,
  doctors = initialDoctors
}) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');

  const [viewingDoctor, setViewingDoctor] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('2026-08-28');
  const [appointmentTime, setAppointmentTime] = useState('09:00 AM');
  const [visitReason, setVisitReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [appointmentFilter, setAppointmentFilter] = useState('All');

  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('PDF');
  const [reportDesc, setReportDesc] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  const [profileName, setProfileName] = useState(currentUser?.name || 'Alex Morgan');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'alex@example.com');
  const [profileAge, setProfileAge] = useState(currentUser?.age || 30);
  const [profileGender, setProfileGender] = useState(currentUser?.gender || 'Female');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '123 Main Street, Cityville');
  const [profileSaved, setProfileSaved] = useState(false);

  const filteredDoctors = doctors.filter(doc => {
    const matchesName = doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
                        doc.specialization.toLowerCase().includes(searchDoctor.toLowerCase());
    const matchesSpec = selectedSpec === 'All' || doc.specialization.toLowerCase() === selectedSpec.toLowerCase();
    return matchesName && matchesSpec;
  });

  const patientApts = appointments.filter(
    a => !currentUser?.email || a.patientEmail === currentUser?.email || a.patientName === currentUser?.name
  );

  const displayedAppointments = patientApts.filter(apt => {
    if (appointmentFilter === 'All') return true;
    if (appointmentFilter === 'Upcoming') return apt.status === 'PENDING' || apt.status === 'ACCEPTED';
    if (appointmentFilter === 'Past') return apt.status === 'COMPLETED' || apt.status === 'REJECTED';
    return true;
  });

  const totalCount = patientApts.length;
  const pendingCount = patientApts.filter(a => a.status === 'PENDING').length;
  const acceptedCount = patientApts.filter(a => a.status === 'ACCEPTED').length;
  const completedCount = patientApts.filter(a => a.status === 'COMPLETED').length;

  const handleOpenDetails = (doc) => {
    setViewingDoctor(doc);
  };

  const handleOpenBooking = (doc) => {
    setBookingDoctor(doc);
    const firstAvailable = doc.slots?.find(s => s.status === 'Available');
    setAppointmentTime(firstAvailable ? firstAvailable.time : '09:00 AM');
    setBookingSuccess(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    const newAppointment = {
      id: 'apt-' + Date.now(),
      patientName: currentUser?.name || 'Alex Morgan',
      patientAge: currentUser?.age || 30,
      patientGender: currentUser?.gender || 'Female',
      patientAddress: currentUser?.address || '123 Main Street, Cityville',
      patientEmail: currentUser?.email || 'alex@example.com',
      doctorId: bookingDoctor.id,
      doctorName: bookingDoctor.name,
      specialization: bookingDoctor.specialization,
      date: appointmentDate,
      time: appointmentTime,
      reason: visitReason || 'General medical consultation',
      status: 'PENDING'
    };

    setAppointments([newAppointment, ...appointments]);
    setBookingSuccess(true);

    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
      setVisitReason('');
      setActiveTab('appointments');
    }, 1300);
  };

  const handleUploadReport = (e) => {
    e.preventDefault();
    if (!reportTitle) return;

    const newReport = {
      id: 'rep-' + Date.now(),
      patientName: currentUser?.name || 'Alex Morgan',
      fileName: reportTitle.endsWith(`.${reportType.toLowerCase()}`) ? reportTitle : `${reportTitle}.${reportType.toLowerCase()}`,
      fileType: reportType,
      uploadDate: new Date().toISOString().split('T')[0],
      description: reportDesc || `Uploaded ${reportType} medical report.`
    };

    setMedicalReports([newReport, ...medicalReports]);
    setReportTitle('');
    setReportDesc('');
    setReportFile(null);
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 2500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (setCurrentUser) {
      setCurrentUser({
        ...currentUser,
        name: profileName,
        email: profileEmail,
        age: Number(profileAge),
        gender: profileGender,
        address: profileAddress
      });
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role="patient" 
        setCurrentUser={setCurrentUser} 
      />

      <div className="main-content">
        <div className="page-title">
          <h2>Patient Dashboard</h2>
          <p>Welcome, {currentUser?.name || 'Alex Morgan'} | Manage appointments and medical records</p>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="grid-cards">
              <div className="stat-box">
                <p>Total Appointments</p>
                <h3>{totalCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#f59e0b' }}>
                <p>Pending Requests</p>
                <h3 style={{ color: '#f59e0b' }}>{pendingCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#2b9348' }}>
                <p>Accepted</p>
                <h3 style={{ color: '#2b9348' }}>{acceptedCount}</h3>
              </div>
              <div className="stat-box" style={{ borderLeftColor: '#0284c7' }}>
                <p>Completed</p>
                <h3 style={{ color: '#0284c7' }}>{completedCount}</h3>
              </div>
            </div>

            <div className="card">
              <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('doctors')} className="btn-primary">
                  🔍 Find Doctors
                </button>
                <button onClick={() => setActiveTab('appointments')} className="btn-secondary">
                  📅 View My Appointments
                </button>
                <button onClick={() => setActiveTab('reports')} className="btn-secondary">
                  📁 Upload Medical Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            <div className="card">
              <div className="form-row">
                <div className="form-group">
                  <label>Search Doctor by Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Jenkins, Vance..." 
                    value={searchDoctor} 
                    onChange={(e) => setSearchDoctor(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Filter by Specialization:</label>
                  <select value={selectedSpec} onChange={(e) => setSelectedSpec(e.target.value)}>
                    <option value="All">All Specializations</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="General Physician">General Physician</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="doctor-grid">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="doctor-item-card">
                  <h3>{doc.name}</h3>
                  <div className="doctor-spec">{doc.specialization}</div>
                  <div className="doctor-info">
                    <strong>Qualification:</strong> {doc.qualification}<br />
                    <strong>Experience:</strong> {doc.experience}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                    {doc.about}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                      Available Slots Today:
                    </div>
                    <div className="slots-container">
                      {doc.slots?.map((slot, index) => (
                        <span 
                          key={index} 
                          className={`slot-badge ${slot.status === 'Available' ? 'slot-available' : 'slot-booked'}`}
                        >
                          {slot.time} ({slot.status})
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button 
                        type="button"
                        onClick={() => handleOpenDetails(doc)} 
                        className="btn-secondary btn-sm" 
                        style={{ flex: 1 }}
                      >
                        View Details
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleOpenBooking(doc)} 
                        className="btn-primary btn-sm" 
                        style={{ flex: 1 }}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="card table-responsive">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: '#0077b6' }}>My Appointments</h3>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Upcoming', 'Past'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setAppointmentFilter(f)}
                    className={appointmentFilter === f ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.length > 0 ? (
                  displayedAppointments.map((apt) => (
                    <tr key={apt.id}>
                      <td><strong>{apt.doctorName}</strong></td>
                      <td>{apt.specialization}</td>
                      <td>{apt.date}</td>
                      <td>{apt.time}</td>
                      <td>{apt.reason}</td>
                      <td>
                        <span className={`badge badge-${apt.status.toLowerCase()}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="card" style={{ maxWidth: '550px' }}>
              <h3 style={{ color: '#0077b6', marginBottom: '12px' }}>Medical Reports</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '15px' }}>
                Upload medical test reports (PDF, JPG, PNG) for your doctors to review.
              </p>

              {reportSuccess && (
                <div className="alert-message alert-success">
                  Medical report uploaded successfully!
                </div>
              )}

              <form onSubmit={handleUploadReport}>
                <div className="form-group">
                  <label>File Name / Title:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blood_Test_Report" 
                    value={reportTitle} 
                    onChange={(e) => setReportTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>File Type:</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="PDF">PDF</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description:</label>
                  <input 
                    type="text" 
                    placeholder="Short description of medical report" 
                    value={reportDesc} 
                    onChange={(e) => setReportDesc(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Select Document File:</label>
                  <input 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setReportFile(e.target.files[0])} 
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Upload Report
                </button>
              </form>
            </div>

            <div className="card table-responsive">
              <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Uploaded Medical Reports</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>File Type</th>
                    <th>Upload Date</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicalReports.map((rep) => (
                    <tr key={rep.id}>
                      <td><strong>{rep.fileName}</strong></td>
                      <td><span className="badge badge-completed">{rep.fileType}</span></td>
                      <td>{rep.uploadDate}</td>
                      <td>{rep.description || 'Medical Report File'}</td>
                      <td>
                        <button 
                          onClick={() => alert(`Viewing document: ${rep.fileName}`)} 
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
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: '550px' }}>
            <h3 style={{ color: '#0077b6', marginBottom: '15px' }}>Patient Profile</h3>

            {profileSaved && (
              <div className="alert-message alert-success">
                Profile changes saved successfully!
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Full Name:</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age:</label>
                  <input 
                    type="number" 
                    value={profileAge} 
                    onChange={(e) => setProfileAge(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Gender:</label>
                  <select value={profileGender} onChange={(e) => setProfileGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Address:</label>
                <input 
                  type="text" 
                  value={profileAddress} 
                  onChange={(e) => setProfileAddress(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {viewingDoctor && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Doctor Details</h3>
                <button onClick={() => setViewingDoctor(null)} className="close-btn">✕</button>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#0077b6', fontSize: '1.2rem' }}>{viewingDoctor.name}</h4>
                <p><strong>Specialization:</strong> {viewingDoctor.specialization}</p>
                <p><strong>Qualification:</strong> {viewingDoctor.qualification}</p>
                <p><strong>Experience:</strong> {viewingDoctor.experience}</p>
                <p style={{ marginTop: '8px' }}><strong>About:</strong> {viewingDoctor.about}</p>

                <div style={{ marginTop: '15px' }}>
                  <strong>Available Slots:</strong>
                  <div className="slots-container" style={{ marginTop: '6px' }}>
                    {viewingDoctor.slots?.map((slot, index) => (
                      <span 
                        key={index} 
                        className={`slot-badge ${slot.status === 'Available' ? 'slot-available' : 'slot-booked'}`}
                      >
                        {slot.time} — {slot.status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setViewingDoctor(null)} className="btn-secondary btn-sm">
                  Close
                </button>
                <button 
                  onClick={() => {
                    const doc = viewingDoctor;
                    setViewingDoctor(null);
                    handleOpenBooking(doc);
                  }} 
                  className="btn-primary btn-sm"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {showBookingModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>Book Appointment</h3>
                <button onClick={() => setShowBookingModal(false)} className="close-btn">✕</button>
              </div>

              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <h3 style={{ color: '#2b9348', marginBottom: '8px' }}>
                    Appointment booked successfully.
                  </h3>
                  <p style={{ color: '#64748b' }}>
                    Status: <span className="badge badge-pending">PENDING</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmBooking}>
                  <div className="form-group">
                    <label>Doctor:</label>
                    <input 
                      type="text" 
                      value={`${bookingDoctor?.name} (${bookingDoctor?.specialization})`} 
                      disabled 
                      style={{ backgroundColor: '#f1f5f9' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Date:</label>
                    <input 
                      type="date" 
                      value={appointmentDate} 
                      onChange={(e) => setAppointmentDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Slot:</label>
                    <select 
                      value={appointmentTime} 
                      onChange={(e) => setAppointmentTime(e.target.value)} 
                      required
                    >
                      {bookingDoctor?.slots?.map((slot, index) => (
                        <option 
                          key={index} 
                          value={slot.time} 
                          disabled={slot.status === 'Booked'}
                        >
                          {slot.time} — {slot.status} {slot.status === 'Booked' ? '(Booked)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reason for Visit:</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe your symptoms or reason for appointment..."
                      value={visitReason} 
                      onChange={(e) => setVisitReason(e.target.value)} 
                      required 
                    />
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '15px', fontSize: '0.85rem' }}>
                    <strong>Booking Summary:</strong><br />
                    Doctor: {bookingDoctor?.name} | Date: {appointmentDate} | Time: {appointmentTime}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowBookingModal(false)} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Confirm Appointment
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
