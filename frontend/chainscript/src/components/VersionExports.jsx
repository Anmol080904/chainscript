import React from 'react';
import { Download, FileCode } from 'lucide-react';
import api from '../api/api';

const VersionExports = ({ versionId, versionNumber }) => {
  const exportPdf = async () => {
     try {
       const res = await api.post(`/export/pdf/${versionId}`, {}, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `version_${versionNumber}_export.html`);
       document.body.appendChild(link);
       link.click();
     } catch(e) { alert('Export failed'); }
  };

  const exportGist = async () => {
     try {
       const res = await api.post(`/export/gist/${versionId}`);
       alert(res.data.message);
     } catch(e) { alert('Export failed'); }
  };

  return (
    <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportPdf} title="Download HTML/PDF Payload">
            <Download size={14} style={{ marginRight: '0.4rem' }} /> Export Local
        </button>
        <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={exportGist} title="Export to GitHub Gist">
            <FileCode size={14} style={{ marginRight: '0.4rem' }} /> Send to Gist
        </button>
    </div>
  );
};

export default VersionExports;
