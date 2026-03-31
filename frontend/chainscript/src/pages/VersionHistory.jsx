import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { History, ShieldCheck, FileEdit, ArrowLeft } from 'lucide-react';
import api from '../api/api';

const VersionHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await api.get(`/posts/${id}/versions`);
        setVersions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <button className="btn-secondary" onClick={() => navigate(`/editor/${id}`)} style={{ padding: '0.4rem 0.8rem', marginBottom: '1rem', border: 'none', background: 'transparent' }}>
             <ArrowLeft size={16} /> Back to Editor
          </button>
          <h1>Complete Version History</h1>
          <p>Chronological timeline of all changes applied to this document.</p>
        </div>
      </div>
      
      {loading ? (
         <div className="loader">Loading history...</div>
      ) : (
         <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <History size={24} color="var(--primary-accent)" /> 
                <h2 style={{ margin: 0 }}>Timeline</h2>
             </div>
             
             {versions.map(v => (
                <div key={v.id} style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--surface-border)' }}>
                   <div style={{ flex: '0 0 100px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(v.created_at).toLocaleDateString()}
                      <br />
                      {new Date(v.created_at).toLocaleTimeString()}
                   </div>

                   <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem' }}>Version {v.version_number}</h3>
                      <p style={{ margin: '0', color: 'var(--text-secondary)' }}>{v.commit_message || 'Auto-saved revision'}</p>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                         <Link to={`/posts/${id}/versions/${v.version_number}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }}>
                            <FileEdit size={14} /> View Details & Changes
                         </Link>
                         
                         {v.has_blockchain_seal ? (
                           <Link to={`/versions/${v.id}/verify`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', textDecoration: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)' }}>
                              <ShieldCheck size={14} /> Trust Assured
                           </Link>
                         ) : (
                           <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '4px' }}>
                              Draft Status
                           </span>
                         )}
                      </div>
                   </div>
                </div>
             ))}
             
             {versions.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No version history recorded yet.</p>}
         </div>
      )}
    </DashboardLayout>
  );
};

export default VersionHistory;
