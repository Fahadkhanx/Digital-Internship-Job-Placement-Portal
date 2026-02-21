import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    // Get email from location state or query params
    const emailFromState = location.state?.email;
    const emailFromQuery = new URLSearchParams(location.search).get('email');
    const emailToUse = emailFromState || emailFromQuery;

    if (!emailToUse) {
      toast.error('Email not found. Please register again.');
      navigate('/register');
      return;
    }

    setEmail(emailToUse);
  }, [location, navigate]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value.replace(/[^0-9]/g, ''); // Only numbers
    
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    
    setCode(newCode);
    
    // Focus last filled input or next empty
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    const nextInput = document.getElementById(`code-${lastFilledIndex + 1}`);
    if (nextInput) nextInput.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/verify-email', {
        email: email,
        code: verificationCode
      });

      if (response.data.success) {
        toast.success('Email verified successfully! You can now login.');
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      toast.error(errorMessage);
      
      // Reset code on error
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled || resendLoading) return;

    setResendLoading(true);

    try {
      const response = await api.post('/auth/resend-verification-code', {
        email: email
      });

      if (response.data.success) {
        toast.success('Verification code sent! Check your email.');
        setResendAttempts(resendAttempts + 1);
        
        // If 3 attempts reached, start 5 minute cooldown
        if (resendAttempts >= 2) {
          setResendDisabled(true);
          setResendCooldown(300); // 5 minutes = 300 seconds
          setResendAttempts(0); // Reset attempts after cooldown starts
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend code';
      toast.error(errorMessage);
      
      // Check if error mentions cooldown
      if (errorMessage.includes('wait') || errorMessage.includes('minute')) {
        const match = errorMessage.match(/(\d+)\s*minute/);
        if (match) {
          const minutes = parseInt(match[1]);
          setResendDisabled(true);
          setResendCooldown(minutes * 60);
        }
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="auth-container">
        <LoadingSpinner message="Verifying your email..." />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <p className="auth-subtitle">
          We've sent a 6-digit verification code to<br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="verification-code-container">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="code-input"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || code.join('').length !== 6}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="resend-code-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className="btn-link"
            onClick={handleResendCode}
            disabled={resendDisabled || resendLoading}
          >
            {resendLoading
              ? 'Sending...'
              : resendDisabled
              ? `Resend Code (${formatTime(resendCooldown)})`
              : resendAttempts >= 3
              ? 'Resend Code (5 min cooldown)'
              : 'Resend Code'}
          </button>
          {resendAttempts > 0 && resendAttempts < 3 && (
            <p className="resend-attempts">Resend attempts: {resendAttempts}/3</p>
          )}
        </div>

        <p className="auth-link">
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate('/register')}
            style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer' }}
          >
            Back to Registration
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

