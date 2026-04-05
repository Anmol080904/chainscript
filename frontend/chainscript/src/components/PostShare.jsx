import React, { useState } from 'react';
import { Link as LinkIcon, Share2 } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';

const PostShare = ({ postId }) => {
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateShare = async () => {
    if (!postId) return toast.warn('SAVE CONTENT NODE BEFORE INITIALIZING BROADCAST.');
    setLoading(true);
    try {
      // Set to expire in 7 days by default for security
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);
      
      const res = await api.post(`/posts/${postId}/share`, { expires_at: expires_at.toISOString() });
      if (res.data.token) {
         setShareLink(`${window.location.origin}/share/${res.data.token}`);
         toast.success("SIGNATURE GENERATED. LINK ACTIVE.");
      }
    } catch(err) {
      toast.error("FAILED TO GENERATE SHARED SIGNATURE.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Share2 size={18} color="var(--primary-accent)" />
        <strong style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '1px' }}>PUBLIC_BROADCAST</strong>
        <button className="btn-secondary" onClick={handleCreateShare} disabled={loading} style={{ marginLeft: 'auto', padding: '0.5rem 0.8rem', fontSize: '0.7rem' }}>
          <LinkIcon size={14} /> {shareLink ? 'REFRESH_TOKEN' : 'GENERATE_LINK'}
        </button>
      </div>
      
      {shareLink ? (
        <div style={{ background: 'rgba(255, 0, 0, 0.05)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.75rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          LINK_STUB: <a href={shareLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-accent)', textDecoration: 'underline' }}>{shareLink}</a>
        </div>
      ) : (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', display: 'block', lineHeight: '1.4' }}>Generate a secure cryptographic signature to allow external access. Valid for 168 hours.</span>
      )}
    </div>
  );
};

export default PostShare;

