import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, Plus, FileEdit, Trash2, Eye, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchPosts = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/posts/search?q=${encodeURIComponent(query)}` : '/posts';
      const response = await api.get(endpoint);
      if (response.data.status) {
        setPosts(response.data.data || []);
      }
    } catch (err) {
      toast.error("Failed to retrieve documents.");
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchPosts(searchQuery);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return;
    
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
      toast.success("Document deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete document.");
      console.error("Failed to delete", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <h1>Dashboard</h1>
          <p>Manage and organize your secured documents.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/editor')}>
          <Plus size={18} /> New Document
        </button>
      </div>
      
      <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search documents..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '3rem', margin: 0 }}
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Loading documents..." />
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <FileText size={64} style={{ color: 'var(--surface-border)', marginBottom: '1.5rem' }} />
          <h3>No documents found</h3>
          <p>You haven't created any documents yet. Start by creating your first sequence.</p>
          <button className="btn-primary" onClick={() => navigate('/editor')} style={{ marginTop: '1.5rem' }}>
            <Plus size={18} /> Create New
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {posts.map(post => (
            <Link to={`/editor/${post.id}`} key={post.id} className="card" style={{ color: 'inherit', textDecoration: 'none' }}>
              <div className="card-title">{post.title || "Untitled Document"}</div>
              <div className="card-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Eye size={14} /> Last updated: {new Date(post.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${post.visibility === 'published' ? 'success' : 'primary'}`}>
                    {post.visibility === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span className="badge">
                    V{post.version_count}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {post.latest_version_id && (
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.4rem', width: '32px', height: '32px', borderRadius: 'var(--radius-sm)' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Call global export or just navigate/trigger
                        // Actually, I can't easily call VersionExports here without importing it.
                        // For now, I'll just link to the version detail or add the logic.
                        // Let's import VersionExports or at least use the same logic.
                        navigate(`/posts/${post.id}/versions/${post.version_count}`);
                      }}
                      title="View & Export PDF"
                    >
                      <FileText size={16} />
                    </button>
                  )}
                  <button 
                    className="btn-danger" 
                    style={{ padding: '0.4rem', width: '32px', height: '32px', borderRadius: 'var(--radius-sm)' }}
                    onClick={(e) => handleDelete(e, post.id)}
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;


