import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Logic: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    console.log("Form Submitted Successfully", formData);
    // Proceed with API call or redirect
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="icon-header">
           <UserPlus size={32} color="var(--accent-color)" />
        </div>
        <h2>Create Account</h2>
        
        {/* Error Message Display */}
        {error && (
          <div className="error-badge">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" value={formData.fullname} onChange={handleChange} placeholder="John Doe" required />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="name@company.com" required />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>
          
          <button type="submit" className="button login-btn">
            Register
          </button>
        </form>
        
        <p className="signup-redirect">
          Already have an account? <span className="link-text" onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;