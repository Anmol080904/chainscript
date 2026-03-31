import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { ShieldCheck, Activity, Key, Link as ExternalLink, CheckCircle } from 'lucide-react';
import api from '../api/api';

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
      } catch(err) {
        setError(err.response?.data?.detail || "Cryptographic proof could not be loaded.");
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
             Cryptographic Audit <ShieldCheck color="var(--success)" size={32} />
          </h1>
          <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Immutable ledger details indicating authenticity and timestamp execution.</p>
        </div>
      </div>

      {loading ? (
        <div className="loader">Auditing ledger...</div>
      ) : error ? (
        <div className="alert-danger" style={{ textAlign: 'center', padding: '3rem' }}>
           <h3>Unable to verify</h3>
           <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
           
           <div className="glass-panel" style={{ border: proof.verified ? '1px solid var(--success)' : '1px solid var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                 {proof.verified ? (
                    <CheckCircle size={32} color="var(--success)" />
                 ) : (
                    <Activity size={32} color="var(--danger)" />
                 )}
                 <div>
                    <h2 style={{ margin: 0, color: proof.verified ? 'var(--success)' : 'var(--danger)' }}>
                       {proof.verified ? 'Verification Succeeded' : 'Verification Fails Checksum'}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>This digital asset has been securely sealed.</p>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                 <div style={{ background: 'var(--background-color)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Key size={14} /> SHA-256 Content Hash Payload
                    </div>
                    <code style={{ wordBreak: 'break-all', color: 'var(--primary-accent)' }}>{proof.content_hash}</code>
                 </div>
                 
                 <div style={{ background: 'var(--background-color)', padding: '1rem', borderRadius: '4px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <Activity size={14} /> Network Transaction Hash (TxHash)
                    </div>
                    <code style={{ wordBreak: 'break-all', color: 'var(--success)' }}>{proof.tx_hash || 'Pending...'}</code>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'var(--background-color)', padding: '1rem', borderRadius: '4px' }}>
                       <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Executed Block Number</div>
                       <strong>{proof.block_number || 'N/A'}</strong>
                    </div>
                    <div style={{ background: 'var(--background-color)', padding: '1rem', borderRadius: '4px' }}>
                       <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Seal Status</div>
                       <strong>{hashData.seal_status.toUpperCase()}</strong>
                    </div>
                 </div>
              </div>

              {proof.etherscan_url && (
                 <a href={proof.etherscan_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', textDecoration: 'none' }}>
                    View on Etherscan Explorer <ExternalLink size={16} style={{ marginLeft: '0.5rem' }} />
                 </a>
              )}
           </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default VerifyVersion;
