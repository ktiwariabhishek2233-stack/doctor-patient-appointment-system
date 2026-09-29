import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ currentUser, setCurrentUser, onNavigateTab }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mediconnect_user');
    localStorage.removeItem('mediconnect_token');
    navigate('/auth');
  };

  const handleDoctorAppointmentsNav = () => {
    navigate('/doctor');
    if (onNavigateTab) {
      onNavigateTab('requests');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        🏥 MediConnect
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {!currentUser ? (
          <>
            <Link to="/patient">Find Doctors</Link>
            <Link to="/auth" state={{ mode: 'login' }}>Login</Link>
            <Link to="/auth" state={{ mode: 'register' }} className="btn-primary btn-sm">Register</Link>
          </>
        ) : currentUser.role === 'doctor' ? (
          <>
            <Link to="/doctor">Dashboard</Link>
            <button 
              onClick={handleDoctorAppointmentsNav} 
              style={{ background: 'none', border: 'none', color: '#444444', fontWeight: 500, padding: '6px 12px', fontSize: '0.95rem', cursor: 'pointer', borderRadius: '4px' }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#e0f2fe'; e.target.style.color = '#0077b6'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#444444'; }}
            >
              Appointments
            </button>
            <span className="user-badge">
              {currentUser.name} (Doctor)
            </span>
            <button onClick={handleLogout} className="btn-danger btn-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/patient">Find Doctors</Link>
            <Link to="/patient">Dashboard</Link>
            <span className="user-badge">
              {currentUser.name} (Patient)
            </span>
            <button onClick={handleLogout} className="btn-danger btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
