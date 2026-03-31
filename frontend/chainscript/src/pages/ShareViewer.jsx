import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Calendar, Clock } from 'lucide-react';
import api from '../api/api';

const ShareViewer = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedPost = async () => {
      try {
        const res = await api.get(`/shares/${token}`);
        if (res.data) {
           setPostData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'This shared link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedPost();
  }, [token]);

  if (loading) return <div className="loader" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading decentralized document...</div>;

  if (error) return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-accent)' }}>Chainscript Explorer</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Public Verified Document</p>
        </div>
        <ShieldCheck size={32} color="var(--success)" />
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{postData.post_title}</h1>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Shared: {new Date(postData.created_at).toLocaleDateString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Expires: {new Date(postData.expires_at).toLocaleString()}
          </span>
        </div>

        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
          {postData.content}
        </div>
      </div>
    </div>
  );
};

export default ShareViewer;
