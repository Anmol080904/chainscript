import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { FileEdit, FileDiff, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../api/api';
import VersionExports from '../components/VersionExports';

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, n]);

  const handleSeal = async () => {
     try {
       const res = await api.post(`/versions/${version.id}/seal`);
       alert(res.data.message);
       // Refresh or redirect
       window.location.reload();
     } catch (e) {
       alert('Seal Failed');
     }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <Link to={`/posts/${id}/versions`} className="btn-secondary" style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', marginBottom: '1rem', border: 'none', background: 'transparent', textDecoration: 'none' }}>
             <ArrowLeft size={16} /> Back to History
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h1 style={{ margin: 0 }}>Version {n} Detail</h1>
             {version?.has_blockchain_seal ? (
                <ShieldCheck size={24} color="var(--success)" title="Sealed and verified" />
             ) : (
                <span className="badge">Draft</span>
             )}
          </div>
          <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Created: {version ? new Date(version.created_at).toLocaleString() : '...'}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {version && <VersionExports versionId={version.id} versionNumber={version.version_number} />}
          
          {version && !version.has_blockchain_seal && (
             <button className="btn-primary" onClick={handleSeal}>
                Seal Now
             </button>
          )}

          {version && version.has_blockchain_seal && (
             <Link to={`/versions/${version.id}/verify`} className="btn-primary" style={{ textDecoration: 'none' }}>
                View Cryptographic Proof
             </Link>
          )}
        </div>
      </div>

      {loading ? (
         <div className="loader">Loading version artifact...</div>
      ) : (
         <>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
               <button 
                 className={activeTab === 'full' ? 'btn-primary' : 'btn-secondary'}
                 onClick={() => setActiveTab('full')}
               >
                 <FileEdit size={16} /> Full Artifact Display
               </button>
               <button 
                 className={activeTab === 'diff' ? 'btn-primary' : 'btn-secondary'}
                 onClick={() => setActiveTab('diff')}
                 disabled={!version.diff_patch || version.diff_patch.length === 0}
               >
                 <FileDiff size={16} /> Diff Patch (Changes)
               </button>
            </div>

            <div className="glass-panel" style={{ minHeight: '400px', background: activeTab === 'diff' ? '#0a0a0a' : 'var(--surface-color)' }}>
               {activeTab === 'full' && (
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                     {version.full_content}
                  </div>
               )}

               {activeTab === 'diff' && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                     {version.diff_patch?.length === 0 ? <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No changes detected from previous version.</p> : (
                       version.diff_patch?.map((diff, idx) => {
                         let bg = 'transparent';
                         let color = 'var(--text-primary)';
                         let prefix = '  ';
                         if (diff.op === 'insert') {
                            bg = 'rgba(16, 185, 129, 0.2)';
                            color = '#6ee7b7';
                            prefix = '+ ';
                         } else if (diff.op === 'delete') {
                            bg = 'rgba(239, 68, 68, 0.2)';
                            color = '#fca5a5';
                            prefix = '- ';
                         }
                         return (
                            <pre key={idx} style={{ background: bg, color, margin: 0, padding: '0.1rem 0.5rem', whiteSpace: 'pre-wrap' }}>
                               <span style={{ opacity: 0.5, marginRight: '1rem' }}>{diff.line}</span>
                               {prefix}{diff.content}
                            </pre>
                         )
                       })
                     )}
                  </div>
               )}
            </div>
         </>
      )}
    </DashboardLayout>
  );
};

export default VersionDetail;
