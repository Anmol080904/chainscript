import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings as SettingsIcon, LogOut, User, Zap, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  
  return (
    <aside className="sidebar">
      <div style={{ padding: '0 1rem', marginBottom: '2.5rem' }}>
        <h2 style={{ color: 'var(--primary-accent)', margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.025em' }}>Chainscript</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
           <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Secure CMS Platform</span>
        </div>
      </div>
      
      <div style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email?.split('@')[0]}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>System Admin</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <User size={18} /> User Profile
        </NavLink>
        <NavLink to="/editor" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          <FileText size={18} /> Create Post
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <SettingsIcon size={18} /> Settings
        </NavLink>
      </nav>
      
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
        <button onClick={logout} className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


