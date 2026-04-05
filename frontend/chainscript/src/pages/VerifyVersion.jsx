import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { ShieldCheck, Activity, Key, Link as ExternalLink, CheckCircle, Database } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyVersion = () => {
  const { versionId } = useParams();
  const [proof, setProof] = useState(null);
  const [hashData, setHashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const proveIdentity = async () => {
      try {
        const [verifyRes, hashRes] = await Promise.all([
          api.get(`/versions/${versionId}/verify`),
          api.get(`/versions/${versionId}/hash`)
        ]);
        setProof(verifyRes.data);
        setHashData(hashRes.data);
        if (verifyRes.data.verified) {
           toast.success("Verification confirmed.");
        } else {
           toast.warning("Verification mismatch detected.");
        }
      } catch(err) {
        const msg = err.response?.data?.detail || "Cryptographic proof could not be loaded.";
        setError(msg);
        toast.error("Audit sequence interrupted.");
      } finally {
        setLoading(false);
      }
    };
    proveIdentity();
  }, [versionId]);

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
             Blockchain Verification <Database color="var(--primary-accent)" size={32} />
          </h1>
          <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Cryptographic details ensuring document authenticity and immutability.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Verifying ledger integrity..." />
      ) : error ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
           <h3 style={{ color: 'var(--danger)' }}>System Error</h3>
           <p>{error}</p>
           <Link to="/dashboard" className="btn-secondary" style={{ marginTop: '2rem' }}>Return to Dashboard</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
           
           <div className="glass-panel" style={{ borderTop: proof.verified ? '4px solid var(--success)' : '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                 {proof.verified ? (
                    <CheckCircle size={48} color="var(--success)" />
                 ) : (
                    <Activity size={48} color="var(--danger)" />
                 )}
                 <div>
                    <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.75rem' }}>
                       {proof.verified ? 'Verification Successful' : 'Verification Failed'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: 500 }}>The document seal is {proof.verified ? 'intact and valid' : 'potentially tampered with'}.</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                 <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                       <Key size={14} /> Content Hash (SHA-256)
                    </div>
                    <code style={{ wordBreak: 'break-all', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'monospace' }}>{proof.content_hash}</code>
                 </div>
                 
                 <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                       <Activity size={14} /> Transaction ID
                    </div>
                    <code style={{ wordBreak: 'break-all', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'monospace' }}>{proof.tx_hash || 'Pending validation...'}</code>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                       <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Block Number</div>
                       <strong style={{ fontSize: '1.25rem' }}>{proof.block_number || 'N/A'}</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                       <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>Seal Status</div>
                       <strong style={{ fontSize: '1.25rem', color: 'var(--primary-accent)' }}>{hashData.seal_status.toUpperCase()}</strong>
                    </div>
                 </div>
              </div>

              {proof.etherscan_url && (
                 <a href={proof.etherscan_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', width: '100%', textDecoration: 'none' }}>
                    View on Blockchain Explorer <ExternalLink size={16} />
                 </a>
              )}
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VerifyVersion;


