import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { Save, History, FileEdit } from 'lucide-react';
import api from '../api/api';
import PostTags from '../components/PostTags';
import PostShare from '../components/PostShare';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [visibility, setVisibility] = useState('draft');
  const [commitMessage, setCommitMessage] = useState('');
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
        const { title, content, visibility, version_count } = res.data.data;
        setPostTitle(title);
        setPostContent(content);
        setVisibility(visibility);
        setVersionCount(version_count || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
        
        fetchPostDetails();
        alert('Post and version saved successfully!');
        setCommitMessage('');
      }
    } catch (e) {
      alert(e.response?.data?.detail || 'Error saving post');
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <h1 style={{ margin: 0, flex: 1 }}>
          <input 
             type="text"
             value={postTitle}
             onChange={e => setPostTitle(e.target.value)}
             placeholder="Post Title..."
             style={{ fontSize: '2rem', fontWeight: 'bold', background: 'transparent', border: 'none', padding: 0, width: '100%' }}
             autoFocus
          />
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <select 
             value={visibility} 
             onChange={e => setVisibility(e.target.value)}
             style={{ margin: 0, width: 'auto' }}
           >
             <option value="draft">Draft</option>
             <option value="published">Published</option>
           </select>
           
           <button className="btn-primary" onClick={handleSave}>
             <Save size={18} /> Save Content
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
         <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '600px' }}>
           {loading ? <div className="loader">Loading content...</div> : (
              <>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <FileEdit size={16} color="var(--primary-accent)" /> 
                    <strong style={{ color: 'var(--text-secondary)' }}>Live Editor</strong>
                 </div>
                 <textarea 
                   value={postContent}
                   onChange={e => setPostContent(e.target.value)}
                   placeholder="Start writing your decentralized content here... Everything you save is versioned and secured."
                   style={{ flex: 1, resize: 'vertical', fontSize: '1rem', border: 'none', background: 'transparent' }}
                 />
                 <div className="form-group" style={{ margin: 0, borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                   <input 
                     type="text" 
                     value={commitMessage}
                     onChange={e => setCommitMessage(e.target.value)}
                     placeholder="Optional commit message for this version..."
                     style={{ border: 'none', borderBottom: '1px solid var(--text-secondary)' }}
                   />
                 </div>
              </>
           )}
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
               <History size={32} color="var(--primary-accent)" style={{ marginBottom: '1rem' }} />
               <h3 style={{ margin: '0 0 0.5rem 0' }}>Version Control</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View the full cryptographic history and change timeline across {versionCount} revisions.</p>
               
               <Link to={`/posts/${id}/versions`} className="btn-secondary" style={{ display: 'inline-flex', marginTop: '1rem', textDecoration: 'none' }}>
                  Explore Timeline
               </Link>
            </div>

            {id && <PostTags postId={id} />}
            {id && <PostShare postId={id} />}
         </div>
      </div>
    </DashboardLayout>
  );
};

export default PostEditor;
