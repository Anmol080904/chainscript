import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Search, Plus, FileEdit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

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
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // debounce search
    const delay = setTimeout(() => {
      fetchPosts(searchQuery);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.delete(`/posts/${id}`);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <h1>Your Posts</h1>
          <p>Manage and create your decentralized content.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/editor')}>
          <Plus size={18} /> New Post
        </button>
      </div>
      
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search posts..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '3rem', margin: 0 }}
        />
      </div>

      {loading ? (
        <div className="loader">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FileEdit size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
          <h3>No posts found</h3>
          <p>Get started by creating your first post.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {posts.map(post => (
            <Link to={`/editor/${post.id}`} key={post.id} className="card" style={{ color: 'inherit' }}>
              <div className="card-title">{post.title}</div>
              <div className="card-meta">
                <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={`badge ${post.visibility === 'published' ? 'success' : ''}`}>
                    {post.visibility}
                  </span>
                  <span className="badge">
                    V{post.version_count}
                  </span>
                </div>
                
                <button 
                  className="btn-danger" 
                  style={{ padding: '0.4rem', borderRadius: '50%' }}
                  onClick={(e) => handleDelete(e, post.id)}
                  title="Delete Post"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
