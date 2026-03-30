import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Save, History, Link as LinkIcon, ShieldCheck, Tag, X, FileDiff } from 'lucide-react';
import api from '../api/api';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState('draft');
  const [postTags, setPostTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'history'
  const [versions, setVersions] = useState([]);
  const [selectedVersionDiff, setSelectedVersionDiff] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    fetchTags();
    if (id) {
      fetchPostDetails();
      fetchVersions();
    }
  }, [id]);

  const fetchTags = async () => {
    try {
      const res = await api.get('/tags');
      setAllTags(res.data);
    } catch(e) {}
  }

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${id}`);
      if (res.data.status) {
        const { title, content, visibility } = res.data.data;
        setPostTitle(title);
        setPostContent(content);
        setVisibility(visibility);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/posts/${id}/versions`);
      setVersions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    try {
      if (!id) return alert('Save post first to share it.');
      // Expire in 7 days
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7);
      
      const res = await api.post(`/posts/${id}/share`, { expires_at: expires_at.toISOString() });
      if (res.data.token) {
         setShareLink(`${window.location.origin}/share/${res.data.token}`);
      }
    } catch(e) {
      alert("Failed to create share link");
    }
  };

  const handleAddTag = async (tagId) => {
     try {
       await api.post(`/posts/${id}/tags`, { tag_id: tagId });
       alert("Tag added!");
     } catch(e) {
       alert("Error adding tag");
     }
  };

  const handleSave = async () => {
    try {
      if (!id) {
        // Create new Post
        const res = await api.post('/posts', { title: postTitle || 'Untitled', visibility });
        if (res.data.status) {
          const newId = res.data.data.id;
          // Save the initial version content
          await api.post(`/posts/${newId}/versions`, { content: postContent, final_message: commitMessage || 'Initial commit' });
          navigate(`/editor/${newId}`);
        }
      } else {
        // Update Title/Visibility
        await api.put(`/posts/${id}`, { title: postTitle, visibility });
        
        // Save new Version to Blockchain
        await api.post(`/posts/${id}/versions`, { content: postContent, final_message: commitMessage || 'Update post content' });
        
        fetchVersions();
        alert('Post and version saved successfully!');
        setCommitMessage('');
      }
    } catch (e) {
      alert(e.response?.data?.detail || 'Error saving post');
    }
  };

  const viewDiff = async (versionNumber) => {
    try {
      const res = await api.get(`/posts/${id}/versions/${versionNumber}/diff`);
      setSelectedVersionDiff(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  
  const verifyVersion = async (versionId) => {
    try {
      const res = await api.get(`/versions/${versionId}/verify`);
      if (res.data.verified) {
         alert(`Blockchain Verified!\nTx: ${res.data.tx_hash}\nBlock: ${res.data.block_number}`);
      } else {
         alert(`Verification failed or not sealed yet.`);
      }
    } catch (e) {
      alert("Error verifying");
    }
  };
  
  const sealVersion = async (versionId) => {
    try {
      const res = await api.post(`/versions/${versionId}/seal`);
      alert(res.data.message);
      fetchVersions();
    } catch(e) {
       alert("Failed to seal");
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <h1 style={{ margin: 0 }}>
          <input 
             type="text"
             value={postTitle}
             onChange={e => setPostTitle(e.target.value)}
             placeholder="Post Title..."
             style={{ fontSize: '2rem', fontWeight: 'bold', background: 'transparent', border: 'none', padding: 0 }}
             autoFocus
          />
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <select 
             value={visibility} 
             onChange={e => setVisibility(e.target.value)}
             style={{ margin: 0, width: 'auto' }}
           >
             <option value="draft">Draft</option>
             <option value="published">Published</option>
           </select>
           
           <button className="btn-secondary" onClick={handleShare}>
             <LinkIcon size={18} /> {shareLink ? 'Link Copied' : 'Share'}
           </button>
           
           <button className="btn-primary" onClick={handleSave}>
             <Save size={18} /> Save & Seal
           </button>
        </div>
      </div>
      
      {shareLink && (
        <div style={{ background: 'var(--success)', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          Share Link: <a href={shareLink} style={{ color: '#fff', textDecoration: 'underline' }}>{shareLink}</a>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          className={activeTab === 'editor' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('editor')}
        >
          <FileEdit size={16} /> Content Editor
        </button>
        <button 
           className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
           disabled={!id}
           onClick={() => setActiveTab('history')}
        >
          <History size={16} /> Version History {id && `(${versions.length})`}
        </button>
      </div>

      {activeTab === 'editor' && (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? <p>Loading content...</p> : (
            <>
              <textarea 
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                placeholder="Start writing your decentralized content here... Everything you save is versioned and secured."
                style={{ height: '500px', resize: 'vertical', fontSize: '1rem' }}
              />
              <div className="form-group" style={{ margin: 0 }}>
                <input 
                  type="text" 
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Optional commit message for this version..."
                />
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div className="glass-panel" style={{ flex: 1, maxHeight: '600px', overflowY: 'auto' }}>
            <h3>Timeline</h3>
            {versions.map(v => (
              <div key={v.id} style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>v{v.version_number} — {v.commit_message || 'Auto-save'}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                       {new Date(v.created_at).toLocaleString()}
                    </span>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => viewDiff(v.version_number)}>
                      <FileDiff size={14} /> View Diff
                    </button>
                    {v.has_blockchain_seal ? (
                      <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--success)' }} onClick={() => verifyVersion(v.id)}>
                        <ShieldCheck size={14} /> Verify Seal
                      </button>
                    ) : (
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => sealVersion(v.id)}>
                        Seal Now
                      </button>
                    )}
                 </div>
              </div>
            ))}
          </div>

          {selectedVersionDiff && (
             <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', maxHeight: '600px', background: '#000' }}>
               <h3 style={{ marginBottom: '1rem' }}>Diff Viewer</h3>
               {selectedVersionDiff.length === 0 ? <p>No changes in this version or initial version.</p> : (
                 <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                   {selectedVersionDiff.map((diff, idx) => {
                     let bg = 'transparent';
                     let color = 'var(--text-primary)';
                     let prefix = '  ';
                     if (diff.op === 'insert') {
                       bg = 'rgba(16, 185, 129, 0.2)'; // Green
                       color = '#6ee7b7';
                       prefix = '+ ';
                     } else if (diff.op === 'delete') {
                       bg = 'rgba(239, 68, 68, 0.2)'; // Red
                       color = '#fca5a5';
                       prefix = '- ';
                     }
                     return (
                       <pre key={idx} style={{ background: bg, color, margin: 0, padding: '0.1rem 0.5rem', whiteSpace: 'pre-wrap' }}>
                          <span style={{ opacity: 0.5, marginRight: '1rem' }}>{diff.line}</span>
                          {prefix}{diff.content}
                       </pre>
                     )
                   })}
                 </div>
               )}
             </div>
          )}
        </div>
      )}

    </DashboardLayout>
  );
};

export default PostEditor;
