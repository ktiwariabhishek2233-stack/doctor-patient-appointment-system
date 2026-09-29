import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ activeTab, setActiveTab, role = 'patient', setCurrentUser }) {
  const navigate = useNavigate();

  const patientTabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'doctors', label: '🔍 Find Doctors' },
    { id: 'appointments', label: '📅 My Appointments' },
    { id: 'reports', label: '📁 Medical Reports' },
    { id: 'profile', label: '👤 Profile' }
  ];

  const doctorTabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'slots', label: '⏰ Manage Slots' },
    { id: 'requests', label: '📋 Appointments' },
    { id: 'reports', label: '📁 Patient Reports' },
    { id: 'profile', label: '👤 Profile' }
  ];

  const tabs = role === 'doctor' ? doctorTabs : patientTabs;

  const handleLogout = () => {
    if (setCurrentUser) setCurrentUser(null);
    localStorage.removeItem('mediconnect_user');
    localStorage.removeItem('mediconnect_token');
    navigate('/auth');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">
        {role === 'doctor' ? 'Doctor Menu' : 'Patient Menu'}
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}

      <button 
        type="button" 
        onClick={handleLogout} 
        className="sidebar-btn sidebar-logout"
      >
        🚪 Logout
      </button>
    </div>
  );
}
