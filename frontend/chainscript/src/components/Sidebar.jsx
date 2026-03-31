import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  
  return (
    <aside className="sidebar">
      <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary-accent)', margin: 0 }}>Chainscript</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CMS Platform</span>
      </div>
      
      <div style={{ padding: '0 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Administrator</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <User size={18} /> Profile
        </NavLink>
        <NavLink to="/editor" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <FileText size={18} /> Create Post
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>
      
      <div style={{ marginTop: 'auto' }}>
        <button onClick={logout} className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
