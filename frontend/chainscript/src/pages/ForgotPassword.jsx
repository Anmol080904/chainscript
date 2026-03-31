import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';
import api from '../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = Verify OTP
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setSuccess("OTP sent to your email (simulated).");
      setError('');
    } catch(err) {
      setError("Failed to request OTP. Make sure the email is registered.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      alert("Password reset successfully. You can now login.");
      navigate('/login');
    } catch(err) {
      setError(err.response?.data?.detail || "Failed to reset password. Invalid OTP or expired.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-accent)' }}>Recover Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Secure, decentralized access recovery.
        </p>
        
        {error && <div className="alert-danger">{error}</div>}
        {success && <div className="alert-success">{success}</div>}
        
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label>Registered Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="Enter your email address"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Send Recovery Code <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
               <label>One-Time Password (OTP)</label>
               <input required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" />
            </div>
            <div className="form-group">
               <label>New Password</label>
               <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-secondary)' }} />
                <input 
                  required 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  style={{ paddingLeft: '2.5rem' }} 
                  placeholder="Set new secure password"
                />
               </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Change Password & Confirm
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
           Remembered your password? <Link to="/login" style={{ color: 'var(--primary-accent)', textDecoration: 'none' }}>Log In here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
