import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset instructions sent to your email');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <LoadingSpinner message="Sending reset instructions..." />
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Check Your Email</h2>
          <p className="auth-message">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <p className="auth-hint">
            Please check your email inbox and follow the instructions to reset your password.
            The link will expire in 24 hours.
          </p>
          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-message">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            Send Reset Instructions
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

