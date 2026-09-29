import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser } from '../api/api';

export default function Auth({ setCurrentUser, doctors, setDoctors }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.state?.mode === 'register' ? false : true);
  const [role, setRole] = useState(location.state?.role || 'patient');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  const [specialization, setSpecialization] = useState('Cardiologist');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
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

      if (role === 'patient') {
        if (!age || Number(age) <= 0) {
          setError('Please enter a valid age.');
          return;
        }
        if (!address.trim()) {
          setError('Please enter your residential address.');
          return;
        }
      } else {
        if (!qualification.trim()) {
          setError('Please enter your medical qualification (e.g. MBBS, MD).');
          return;
        }
        if (!experience.trim()) {
          setError('Please enter your years of experience.');
          return;
        }
      }

      setLoading(true);
      try {
        const payload = role === 'patient' ? {
          name: fullName.trim(),
          email: cleanEmail,
          password: password,
          role: 'patient',
          age: Number(age),
          gender: gender,
          address: address.trim(),
          phone: '555-0199'
        } : {
          name: fullName.trim(),
          email: cleanEmail,
          password: password,
          role: 'doctor',
          specialization: specialization,
          qualification: qualification.trim(),
          experience: experience.trim(),
          about: `Specialist in ${specialization} with ${experience.trim()} experience.`
        };

        const data = await registerUser(payload);
        if (data.token) {
          localStorage.setItem('mediconnect_token', data.token);
        }
        if (data.user) {
          setCurrentUser(data.user);
          navigate(data.user.role === 'doctor' ? '/doctor' : '/patient');
        }
      } catch (err) {
        console.error('Registration failed:', err);
        setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const data = await loginUser({ email: cleanEmail, password, role });
        if (data.token) {
          localStorage.setItem('mediconnect_token', data.token);
        }
        if (data.user) {
          setCurrentUser(data.user);
          navigate(data.user.role === 'doctor' ? '/doctor' : '/patient');
        }

      } catch (err) {
        console.error('Login failed:', err);
        setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
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

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? `Login as ${role === 'doctor' ? 'Doctor' : 'Patient'}` : `Register as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
