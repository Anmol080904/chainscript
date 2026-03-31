import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { User, Activity, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalVersions: 0,
    sealedVersions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // We calculate stats based on the user's posts
      const res = await api.get('/posts');
      if (res.data.status) {
        let total = 0;
        let published = 0;
        let versions = 0;

        res.data.data.forEach(p => {
          total++;
          if (p.visibility === 'published') published++;
          versions += p.version_count || 0;
        });

        // Note: Full sealed versions count would require looping through all versions,
        // For simplicity, we just show total versions here.
        setStats({
          totalPosts: total,
          publishedPosts: published,
          totalVersions: versions,
          sealedVersions: 'N/A' // Requires extra fetches
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="header-row">
        <div>
          <h1>User Profile</h1>
          <p>Analytics and your account overview.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{user?.email}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Active User • Decentralized Author</p>
        </div>
      </div>

      <div className="grid-cards">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'default' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <FileText size={24} color="var(--primary-accent)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{loading ? '-' : stats.totalPosts}</h3>
            <span style={{ color: 'var(--text-secondary)' }}>Total Documents</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'default' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <Activity size={24} color="var(--success)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{loading ? '-' : stats.publishedPosts}</h3>
            <span style={{ color: 'var(--text-secondary)' }}>Published Posts</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'default' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle size={24} color="#8b5cf6" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{loading ? '-' : stats.totalVersions}</h3>
            <span style={{ color: 'var(--text-secondary)' }}>Total Revisions & Versions</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
