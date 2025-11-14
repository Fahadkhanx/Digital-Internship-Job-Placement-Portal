import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (userType === 'student' && (!formData.firstName || !formData.lastName)) {
      toast.error('Please enter your first and last name');
      return;
    }

    if (userType === 'employer' && !formData.companyName) {
      toast.error('Please enter your company name');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (userType === 'student') {
        response = await authService.registerStudent({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      } else {
        response = await authService.registerEmployer({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
        });
      }

      if (response.success) {
        toast.success('Registration successful!');
        if (userType === 'student' && response.token) {
          localStorage.setItem('user', JSON.stringify({ userType: 'Student', email: formData.email }));
          navigate('/student/dashboard');
        } else {
          toast.info('Employer registration pending verification. Please login after verification.');
          navigate('/login');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <LoadingSpinner message="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us to find the best opportunities</p>
        <div className="user-type-selector">
          <button
            type="button"
            className={userType === 'student' ? 'active' : ''}
            onClick={() => setUserType('student')}
            disabled={loading}
          >
            I'm a Student
          </button>
          <button
            type="button"
            className={userType === 'employer' ? 'active' : ''}
            onClick={() => setUserType('employer')}
            disabled={loading}
          >
            I'm an Employer
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              disabled={loading}
            />
            <small className="form-hint">Password must be at least 6 characters long</small>
          </div>
          {userType === 'student' ? (
            <>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
                disabled={loading}
              />
              <small className="form-hint">Your company will be verified by an administrator</small>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
