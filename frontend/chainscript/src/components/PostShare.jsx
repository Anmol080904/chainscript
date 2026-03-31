import React, { useState } from 'react';
import { Link as LinkIcon, Share2 } from 'lucide-react';
import api from '../api/api';

const PostShare = ({ postId }) => {
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateShare = async () => {
    if (!postId) return alert('Save document first to share it.');
    setLoading(true);
    try {
      // Set to expire in 7 days by default for security
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);
      
      const res = await api.post(`/posts/${postId}/share`, { expires_at: expires_at.toISOString() });
      if (res.data.token) {
         setShareLink(`${window.location.origin}/share/${res.data.token}`);
      }
    } catch(err) {
      alert("Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--surface-border)', marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Share2 size={16} color="#8b5cf6" />
        <strong>Public Sharing</strong>
        <button className="btn-secondary" onClick={handleCreateShare} disabled={loading} style={{ marginLeft: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <LinkIcon size={14} /> {shareLink ? 'Update Token' : 'Generate Shared Link'}
        </button>
      </div>
      
      {shareLink ? (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.875rem', wordBreak: 'break-all' }}>
          Shareable Link: <a href={shareLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--success)', textDecoration: 'underline' }}>{shareLink}</a>
        </div>
      ) : (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Generate a secure signature to allow anyone to read this post without an account. Link expires in 7 days.</span>
      )}
    </div>
  );
};

export default PostShare;
