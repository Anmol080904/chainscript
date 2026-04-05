import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { FileEdit, FileDiff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/api';
import VersionExports from '../components/VersionExports';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const VersionDetail = () => {
  const { id, n } = useParams();
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full'); // 'full' or 'diff'

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/posts/${id}/versions/${n}`);
        setVersion(res.data);
      } catch (err) {
        toast.error("Failed to load version details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, n]);

  const handleSeal = async () => {
     try {
       toast.info("Sealing document on blockchain...");
       const res = await api.post(`/versions/${version.id}/seal`);
       toast.success(res.data.message || "Document sealed successfully.");
       // Refresh or redirect
       setTimeout(() => window.location.reload(), 1500);
     } catch (e) {
       toast.error('Seal Failed');
     }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading version details..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="header-row" style={{ marginBottom: '2.5rem' }}>
        <div>
          <Link to={`/posts/${id}/versions`} className="btn-secondary" style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', marginBottom: '1rem', border: 'none', background: 'transparent', textDecoration: 'none', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
             <ArrowLeft size={16} /> Back to History
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h1 style={{ margin: 0, fontSize: '2.25rem' }}>Version {n}</h1>
             {version?.has_blockchain_seal ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                   <ShieldCheck size={16} /> SEALED
                </div>
             ) : (
                <span className="badge">DRAFT</span>
             )}
          </div>
          <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Captured: {version ? new Date(version.created_at).toLocaleString() : '...'}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {version && <VersionExports versionId={version.id} versionNumber={version.version_number} />}
          
          {version && !version.has_blockchain_seal && (
             <button className="btn-primary" onClick={handleSeal}>
                <CheckCircle2 size={16} /> Seal Document
             </button>
          )}

          {version && version.has_blockchain_seal && (
             <Link to={`/versions/${version.id}/verify`} className="btn-primary" style={{ textDecoration: 'none' }}>
                <ShieldCheck size={16} /> Verify Integrity
             </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '2.5rem' }}>
         <button 
           className="tab-button"
           style={{ 
             padding: '1rem 2rem', 
             border: 'none', 
             background: 'transparent', 
             cursor: 'pointer',
             fontWeight: 700,
             color: activeTab === 'full' ? 'var(--primary-accent)' : 'var(--text-secondary)',
             borderBottom: activeTab === 'full' ? '2px solid var(--primary-accent)' : '2px solid transparent',
             marginBottom: '-2px',
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem'
           }}
           onClick={() => setActiveTab('full')}
         >
           <FileEdit size={18} /> Full Document
         </button>
         <button 
           className="tab-button"
           style={{ 
             padding: '1rem 2rem', 
             border: 'none', 
             background: 'transparent', 
             cursor: 'pointer',
             fontWeight: 700,
             color: activeTab === 'diff' ? 'var(--primary-accent)' : 'var(--text-secondary)',
             borderBottom: activeTab === 'diff' ? '2px solid var(--primary-accent)' : '2px solid transparent',
             marginBottom: '-2px',
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem'
           }}
           onClick={() => setActiveTab('diff')}
           disabled={!version.diff_patch || version.diff_patch.length === 0}
         >
           <FileDiff size={18} /> Review Changes
         </button>
      </div>

      <div className="glass-panel" style={{ minHeight: '500px', padding: '2.5rem', background: activeTab === 'diff' ? '#f8fafc' : 'white' }}>
         {activeTab === 'full' && (
            <div style={{ fontSize: '1.125rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
               {version.full_content}
            </div>
         )}

         {activeTab === 'diff' && (
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
               {version.diff_patch?.length === 0 ? <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No changes detected from previous version.</p> : (
                 version.diff_patch?.map((diff, idx) => {
                   let bg = 'transparent';
                   let color = 'var(--text-primary)';
                   let prefix = '  ';
                   if (diff.op === 'insert') {
                      bg = 'rgba(16, 185, 129, 0.1)';
                      color = '#065f46';
                      prefix = '+ ';
                   } else if (diff.op === 'delete') {
                      bg = 'rgba(239, 68, 68, 0.1)';
                      color = '#991b1b';
                      prefix = '- ';
                   }
                   return (
                      <pre key={idx} style={{ background: bg, color, margin: 0, padding: '0.25rem 1rem', whiteSpace: 'pre-wrap' }}>
                         <span style={{ opacity: 0.4, marginRight: '1.5rem', userSelect: 'none', display: 'inline-block', width: '30px' }}>{diff.line}</span>
                         {prefix}{diff.content}
                      </pre>
                   )
                 })
               )}
            </div>
         )}
      </div>
    </DashboardLayout>
  );
};

export default VersionDetail;

