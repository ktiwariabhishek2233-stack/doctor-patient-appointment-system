import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { initialUsers, initialDoctors, initialPatients } from '../data/data';

export default function Auth({ setCurrentUser, doctors, setDoctors }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.mode === 'register' ? false : true);
  const [role, setRole] = useState(location.state?.role || 'patient'); // 'patient' | 'doctor'

  // Shared Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Patient Fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('Cardiologist');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');

  // Helper to load or initialize registered users from localStorage
  const getRegisteredUsers = () => {
    const saved = localStorage.getItem('mediconnect_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialUsers;
      }
    }
    localStorage.setItem('mediconnect_registered_users', JSON.stringify(initialUsers));
    return initialUsers;
  };

  // Update role/mode if location state changes
  useEffect(() => {
    if (location.state?.role) {
      setRole(location.state.role);
    }
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    // Common Validation
    if (!cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    const registeredUsers = getRegisteredUsers();

    if (!isLogin) {
      // Registration Validations
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      // Check if email already registered across system
      const emailExistsInUsers = registeredUsers.some(
        u => u.email && u.email.trim().toLowerCase() === cleanEmail
      );
      const emailExistsInDoctors = (doctors || initialDoctors).some(
        d => d.email && d.email.trim().toLowerCase() === cleanEmail
      );
      const emailExistsInPatients = initialPatients.some(
        p => p.email && p.email.trim().toLowerCase() === cleanEmail
      );

      if (emailExistsInUsers || emailExistsInDoctors || emailExistsInPatients) {
        setError(
          `The email address "${email.trim()}" is already registered. Please log in with this email or use a different email address.`
        );
        return;
      }

      if (role === 'patient') {
        if (!age || Number(age) <= 0) {
          setError('Please enter a valid age.');
          return;
        }
        if (!address.trim()) {
          setError('Please enter your residential address.');
          return;
        }

        // Create new patient
        const newPatient = {
          id: 'pat-' + Date.now(),
          name: fullName.trim(),
          email: cleanEmail,
          password: password,
          role: 'patient',
          age: Number(age),
          gender: gender,
          address: address.trim(),
          phone: '555-0199'
        };

        // Save to registered users
        const updatedUsers = [...registeredUsers, newPatient];
        localStorage.setItem('mediconnect_registered_users', JSON.stringify(updatedUsers));

        // Set current session user
        setCurrentUser(newPatient);
        localStorage.setItem('mediconnect_user', JSON.stringify(newPatient));
        navigate('/patient');
      } else {
        // Doctor Registration
        if (!qualification.trim()) {
          setError('Please enter your medical qualification (e.g. MBBS, MD).');
          return;
        }
        if (!experience.trim()) {
          setError('Please enter your years of experience.');
          return;
        }

        const doctorName = fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`;
        const expStr = experience.trim().toLowerCase().includes('year') ? experience.trim() : `${experience.trim()} Years`;
        const newDocId = 'doc-' + Date.now();

        const newDoctor = {
          id: newDocId,
          name: doctorName,
          email: cleanEmail,
          password: password,
          role: 'doctor',
          specialization: specialization,
          qualification: qualification.trim(),
          experience: expStr,
          about: `Specialist in ${specialization} with ${expStr} experience.`
        };

        // Save to registered users
        const updatedUsers = [...registeredUsers, newDoctor];
        localStorage.setItem('mediconnect_registered_users', JSON.stringify(updatedUsers));

        // Add to active doctors list so patients can book appointments with new doctor
        if (setDoctors) {
          const doctorEntry = {
            id: newDocId,
            name: doctorName,
            email: cleanEmail,
            specialization: specialization,
            qualification: qualification.trim(),
            experience: expStr,
            about: `Specialist in ${specialization} with ${expStr} experience.`,
            slots: [
              { id: `s-${Date.now()}-1`, time: '09:00 AM', status: 'Available' },
              { id: `s-${Date.now()}-2`, time: '11:00 AM', status: 'Available' },
              { id: `s-${Date.now()}-3`, time: '02:00 PM', status: 'Available' },
              { id: `s-${Date.now()}-4`, time: '04:00 PM', status: 'Available' }
            ]
          };
          setDoctors(prev => [...prev, doctorEntry]);
        }

        // Set current session user
        setCurrentUser(newDoctor);
        localStorage.setItem('mediconnect_user', JSON.stringify(newDoctor));
        navigate('/doctor');
      }
    } else {
      // Login Flow
      const matchedUser = registeredUsers.find(
        u => u.email && u.email.trim().toLowerCase() === cleanEmail
      );

      if (!matchedUser) {
        // Check if demo doctor/patient matched by email
        const doctorMatch = (doctors || initialDoctors).find(
          d => d.email && d.email.trim().toLowerCase() === cleanEmail
        );
        const patientMatch = initialPatients.find(
          p => p.email && p.email.trim().toLowerCase() === cleanEmail
        );

        if (!doctorMatch && !patientMatch) {
          setError(`No account found with email "${email.trim()}". Please check your email or click "Register" to create a new account.`);
          return;
        }

        const fallbackUser = doctorMatch ? {
          ...doctorMatch,
          role: 'doctor',
          password: 'password123'
        } : {
          ...patientMatch,
          role: 'patient',
          password: 'password123'
        };

        if (fallbackUser.role !== role) {
          setError(`This email belongs to a ${fallbackUser.role === 'doctor' ? 'Doctor' : 'Patient'}. Please select "${fallbackUser.role === 'doctor' ? 'Doctor' : 'Patient'}" to log in.`);
          return;
        }

        setCurrentUser(fallbackUser);
        localStorage.setItem('mediconnect_user', JSON.stringify(fallbackUser));
        navigate(fallbackUser.role === 'doctor' ? '/doctor' : '/patient');
        return;
      }

      // Check role mismatch
      if (matchedUser.role !== role) {
        setError(`This email is registered as a ${matchedUser.role === 'doctor' ? 'Doctor' : 'Patient'}. Please select "${matchedUser.role === 'doctor' ? 'Doctor' : 'Patient'}" above to log in.`);
        return;
      }

      // Check password if set
      if (matchedUser.password && matchedUser.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Log in
      setCurrentUser(matchedUser);
      localStorage.setItem('mediconnect_user', JSON.stringify(matchedUser));
      navigate(matchedUser.role === 'doctor' ? '/doctor' : '/patient');
    }
  };

  // Quick Demo Logins
  const handleQuickDemo = (demoRole) => {
    setError('');
    if (demoRole === 'patient') {
      const user = {
        id: 'pat-1',
        name: 'Alex Morgan',
        role: 'patient',
        email: 'alex@example.com',
        age: 30,
        gender: 'Female',
        address: '123 Main Street, Cityville',
        phone: '555-0199'
      };
      setCurrentUser(user);
      localStorage.setItem('mediconnect_user', JSON.stringify(user));
      navigate('/patient');
    } else {
      const user = {
        id: 'doc-1',
        name: 'Dr. Sarah Jenkins',
        role: 'doctor',
        email: 'sarah@mediconnect.org',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardiology)',
        experience: '10 Years'
      };
      setCurrentUser(user);
      localStorage.setItem('mediconnect_user', JSON.stringify(user));
      navigate('/doctor');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        {/* Toggle Login/Register */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
          >
            Login
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
          >
            Register
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#0077b6' }}>
          {isLogin ? `${role === 'doctor' ? 'Doctor' : 'Patient'} Login` : `${role === 'doctor' ? 'Doctor' : 'Patient'} Registration`}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
          Doctor-Patient Appointment Management System
        </p>

        {infoMessage && (
          <div className="alert-message" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
            ℹ️ {infoMessage}
          </div>
        )}

        {error && (
          <div className="alert-message alert-error" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>⚠️ {error}</div>
            {!isLogin && error.includes('already registered') && (
              <button 
                type="button" 
                onClick={() => { setIsLogin(true); setError(''); }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#b91c1c', 
                  fontWeight: '600', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  fontSize: '0.88rem'
                }}
              >
                👉 Click here to switch to Login
              </button>
            )}
          </div>
        )}

        {successMessage && (
          <div className="alert-message" style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Select Role */}
          <div className="form-group">
            <label>I am a:</label>
            <div className="role-radio-group">
              <label>
                <input 
                  type="radio" 
                  name="role" 
                  value="patient" 
                  checked={role === 'patient'} 
                  onChange={() => { setRole('patient'); setError(''); setInfoMessage(''); }} 
                />
                Patient
              </label>
              <label>
                <input 
                  type="radio" 
                  name="role" 
                  value="doctor" 
                  checked={role === 'doctor'} 
                  onChange={() => { setRole('doctor'); setError(''); setInfoMessage(''); }} 
                />
                Doctor
              </label>
            </div>
          </div>

          {/* Full Name for Registration */}
          {!isLogin && (
            <div className="form-group">
              <label>Full Name:</label>
              <input 
                type="text" 
                placeholder={role === 'doctor' ? 'e.g. Dr. Jennifer Adams' : 'e.g. John Doe'} 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label>Email Address:</label>
            <input 
              type="email" 
              placeholder={role === 'doctor' ? 'e.g. sarah@mediconnect.org' : 'e.g. alex@example.com'}
              value={email} 
              onChange={(e) => { setEmail(e.target.value); setError(''); }} 
              required 
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password:</label>
            <input 
              type="password" 
              placeholder={isLogin ? 'Enter your password' : 'Create password (min 6 chars)'} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* Confirm Password for Registration */}
          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password:</label>
              <input 
                type="password" 
                placeholder="Re-enter password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>
          )}

          {/* Patient Specific Fields */}
          {!isLogin && role === 'patient' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Age:</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 28" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    min="1"
                    max="120"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Gender:</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
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
                  placeholder="Enter residential address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          {/* Doctor Specific Fields */}
          {!isLogin && role === 'doctor' && (
            <>
              <div className="form-group">
                <label>Specialization:</label>
                <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="General Physician">General Physician</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Qualification:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MBBS, MD" 
                    value={qualification} 
                    onChange={(e) => setQualification(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Experience:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 8 Years" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? `Login as ${role === 'doctor' ? 'Doctor' : 'Patient'}` : `Register as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
          </button>
        </form>

        {/* Quick Demo Login */}
        <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
            Quick Demo Accounts:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('patient')} 
              className="btn-secondary btn-sm"
              title="Login as Alex Morgan (Patient)"
            >
              Demo Patient (alex@example.com)
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickDemo('doctor')} 
              className="btn-secondary btn-sm"
              title="Login as Dr. Sarah Jenkins (Doctor)"
            >
              Demo Doctor (sarah@mediconnect.org)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
