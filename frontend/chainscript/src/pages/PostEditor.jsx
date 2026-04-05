import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Save, History, FileEdit, FileText, ChevronLeft } from 'lucide-react';
import api from '../api/api';
import PostTags from '../components/PostTags';
import PostShare from '../components/PostShare';
import VersionExports from '../components/VersionExports';
import { toast } from 'react-toastify';

import LoadingSpinner from '../components/LoadingSpinner';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState('draft');
  const [commitMessage, setCommitMessage] = useState('');
  const [latestVersionId, setLatestVersionId] = useState(null);
  const [versionCount, setVersionCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPostDetails();
    }
  }, [id]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${id}`);
      if (res.data.status) {
        const { title, content, visibility, version_count, latest_version_id } = res.data.data;
        setPostTitle(title);
        setPostContent(content);
        setVisibility(visibility);
        setVersionCount(version_count || 0);
        setLatestVersionId(latest_version_id);
      }
    } catch (e) {
      toast.error("Failed to load document content.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {

    if (!postTitle.trim()) return toast.warn("Please provide a title.");
    setIsSaving(true);
    try {
      if (!id) {
        // Create new Post
        const res = await api.post('/posts', { title: postTitle, visibility });
        if (res.data.status) {
          const newId = res.data.data.id;
          // Save the initial version content
          await api.post(`/posts/${newId}/versions`, { content: postContent, final_message: commitMessage || 'Initial version created' });
          toast.success("Document created successfully.");
          navigate(`/editor/${newId}`);
        }
      } else {
        // Update Title/Visibility
        await api.put(`/posts/${id}`, { title: postTitle, visibility });
        
        // Save new Version
        await api.post(`/posts/${id}/versions`, { content: postContent, final_message: commitMessage || 'Updated document content' });
        
        await fetchPostDetails();
        toast.success("Changes saved successfully.");
        setCommitMessage('');
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner message="Loading editor..." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
           <ChevronLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="header-row" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, flex: 1 }}>
          <input 
             type="text"
             value={postTitle}
             onChange={e => setPostTitle(e.target.value)}
             placeholder="Document Title"
             style={{ fontSize: '2.5rem', fontWeight: '800', background: 'transparent', border: 'none', padding: 0, width: '100%', color: 'var(--text-primary)', outline: 'none', boxShadow: 'none' }}
             autoFocus
          />
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <select 
             value={visibility} 
             onChange={e => setVisibility(e.target.value)}
             style={{ margin: 0, width: 'auto', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--surface-border)', background: 'white' }}
           >
             <option value="draft">Private Draft</option>
             <option value="published">Public Access</option>
           </select>
           
           <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem' }}>
         <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '650px', padding: '2.5rem' }}>
            <textarea 
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Write your content here... all changes are securely versioned on the blockchain."
              style={{ flex: 1, resize: 'none', fontSize: '1.125rem', border: 'none', background: 'transparent', outline: 'none', lineHeight: '1.7', padding: 0, margin: 0, minHeight: '400px' }}
            />
            <div style={{ marginTop: 'auto', borderTop: '1.5px solid #f1f5f9', paddingTop: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Revision Summary (Optional)</label>
                <input 
                  type="text" 
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  style={{ border: 'none', borderBottom: '1.5px solid var(--surface-border)', marginBottom: 0, background: 'transparent', padding: '0.75rem 0', borderRadius: 0 }}
                />
              </div>
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <History size={20} color="var(--primary-accent)" /> 
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Security & History</h3>
               </div>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                 This document has <strong>{versionCount}</strong> verified revisions. Every version is cryptographically sealed for integrity.
               </p>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <Link to={`/posts/${id}/versions`} className="btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
                     View Version History
                  </Link>
                  {latestVersionId && (
                     <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', marginTop: '0.2rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.8rem' }}>Export Latest Version</div>
                        <VersionExports versionId={latestVersionId} versionNumber={versionCount} />
                     </div>
                  )}
               </div>
            </div>


            {id && <PostTags postId={id} />}
            {id && <PostShare postId={id} />}
         </div>
      </div>
    </DashboardLayout>
  );
};

export default PostEditor;

