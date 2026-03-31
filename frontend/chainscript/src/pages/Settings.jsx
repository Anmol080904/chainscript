import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Tag, Key, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tags');
  
  // Tags State
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  
  // Password State
  const [email, setEmail] = useState(user?.email || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (activeTab === 'tags') fetchTags();
  }, [activeTab]);

  const fetchTags = async () => {
    try {
      const res = await api.get('/tags');
      setTags(res.data || []);
    } catch(e) {
      console.error(e);
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName) return;
    try {
      const res = await api.post('/tags', { name: newTagName });
      setTags([...tags, res.data]);
      setNewTagName('');
    } catch(e) {
      alert("Failed to create tag (it might already exist).");
    }
  };

  const handleRequestOtp = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      setOtpSent(true);
      alert("OTP has been simulated and sent to your email (check server console).");
    } catch(e) {
      alert("Failed to request OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      alert("Password updated successfully!");
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
    } catch(e) {
      alert(e.response?.data?.detail || "Failed to reset password.");
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <h1>Settings</h1>
          <p>Manage application preferences and global tags.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          className={activeTab === 'tags' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('tags')}
        >
          <Tag size={16} /> Global Tags
        </button>
        <button 
           className={activeTab === 'account' ? 'btn-primary' : 'btn-secondary'}
           onClick={() => setActiveTab('account')}
        >
          <Key size={16} /> Change Password
        </button>
      </div>

      {activeTab === 'tags' && (
        <div className="glass-panel" style={{ maxWidth: '600px' }}>
          <h2>Manage Tags</h2>
          <p style={{ color: 'var(--text-secondary)' }}>These tags can be assigned to categorize your posts.</p>
          
          <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              placeholder="E.g., Engineering, DevSecOps..." 
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              style={{ margin: 0, flex: 1 }}
            />
            <button type="submit" className="btn-primary">
              <Plus size={18} /> Add Tag
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            {tags.map(t => (
              <span key={t.id} style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Tag size={14} color="var(--primary-accent)" /> {t.name}
              </span>
            ))}
            {tags.length === 0 && <span style={{ color: 'var(--text-secondary)' }}>No tags created yet.</span>}
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="glass-panel" style={{ maxWidth: '400px' }}>
          <h2>Security</h2>
          
          {!otpSent ? (
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>We will send an OTP to your email to verify your identity.</p>
              <div className="form-group">
                <label>Email</label>
                <input value={email} disabled style={{ opacity: 0.7 }} />
              </div>
              <button className="btn-primary" onClick={handleRequestOtp} style={{ width: '100%' }}>
                Request OTP to Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>OTP Code</label>
                <input required type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter strong password" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Update Password
              </button>
            </form>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings;
