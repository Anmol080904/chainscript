import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { History, ShieldCheck, FileEdit, ArrowLeft, Database, Clock } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

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
        toast.error("Failed to load history.");
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
          <button className="btn-secondary" onClick={() => navigate(`/editor/${id}`)} style={{ padding: '0.4rem 0.8rem', marginBottom: '1.5rem', border: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--primary-accent)', fontWeight: 600 }}>
             <ArrowLeft size={16} /> Back to Editor
          </button>
          <h1>Document History</h1>
          <p>A chronological record of all verified changes to this document.</p>
        </div>
      </div>
      
      {loading ? (
         <LoadingSpinner message="Retrieving history..." />
      ) : (
         <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                <Clock size={24} color="var(--primary-accent)" /> 
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>History Log</h2>
             </div>
             
             {versions.map((v, index) => (
                <div key={v.id} style={{ display: 'flex', gap: '2.5rem', marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: index !== versions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                   <div style={{ flex: '0 0 140px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(v.created_at).toLocaleDateString()}</div>
                      <div style={{ color: 'var(--primary-accent)', fontWeight: 500 }}>{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>

                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Version {v.version_number}</h3>
                        {v.has_blockchain_seal ? (
                           <span className="badge success" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>VERIFIED</span>
                        ) : (
                           <span className="badge" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>PROCESSING</span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{v.commit_message || 'Initial document creation'}</p>
                      
                      <div style={{ display: 'flex', gap: '1rem' }}>
                         <Link to={`/posts/${id}/versions/${v.version_number}`} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                            <FileEdit size={14} /> View Details
                         </Link>
                         
                         {v.has_blockchain_seal && (
                            <Link to={`/versions/${v.id}/verify`} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                               <ShieldCheck size={14} /> Verify Seal
                            </Link>
                         )}
                      </div>
                   </div>
                </div>
             ))}
             
             {versions.length === 0 && (
               <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                 <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                 <p>No historical versions found for this document.</p>
               </div>
             )}
         </div>
      )}
    </DashboardLayout>
  );
};

export default VersionHistory;

