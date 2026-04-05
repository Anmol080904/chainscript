import React from 'react';
import { Download, FileCode, FileText } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';

const VersionExports = ({ versionId, versionNumber }) => {
  const exportPdf = async () => {
     try {
       toast.info("Preparing PDF artifact...");
       const res = await api.post(`/export/pdf/${versionId}`, {}, { responseType: 'blob' });
       const url = window.URL.createObjectURL(new Blob([res.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download', `chainscript_v${versionNumber}_export.pdf`);
       document.body.appendChild(link);
       link.click();
       toast.success("PDF exported successfully.");
     } catch(e) { 
       toast.error('PDF Export failed'); 
     }
  };

  const exportGist = async () => {
     try {
       toast.info("Sending to GitHub Gist...");
       const res = await api.post(`/export/gist/${versionId}`);
       toast.success(res.data.message || "Exported to Gist.");
     } catch(e) { 
       toast.error('Gist Export failed'); 
     }
  };

  return (
    <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={exportPdf} title="Download as PDF">
            <FileText size={16} /> PDF Export
        </button>
        <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={exportGist} title="Export to GitHub Gist">
            <FileCode size={16} /> Export to Gist
        </button>
    </div>
  );
};

export default VersionExports;

