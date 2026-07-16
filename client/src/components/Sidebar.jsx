import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user, onLogout }) {
  // Enforce Role-Based Navigation: Clerks cannot access Forensic Cases
  const isClerk = user?.role === 'Clerk';

  return (
    <div style={styles.sidebar}>
      {/* Dynamic CSS Styles Injection for Interactive Elements */}
      <style>{`
        .logout-btn {
          border: 1px solid rgba(239, 68, 68, 0.3);
          background-color: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          width: 100%;
          text-align: center;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .logout-btn:hover {
          background-color: #ef4444;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .sidebar-link:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>

      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>I</div>
        <div style={styles.logoText}>INVEX FORENSIC</div>
      </div>
      <nav style={styles.nav}>
        <NavLink 
          to="/" 
          className="sidebar-link"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <span style={styles.linkIcon}>📊</span> Dashboard
        </NavLink>
        <NavLink 
          to="/patients" 
          className="sidebar-link"
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : {})
          })}
        >
          <span style={styles.linkIcon}>👤</span> Patients
        </NavLink>
        
        {/* Hide 'Cases' tab from Clerks */}
        {!isClerk && (
          <NavLink 
            to="/cases" 
            className="sidebar-link"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.linkIcon}>💼</span> Forensic Cases
          </NavLink>
        )}
      </nav>
      <div style={styles.footer}>
        <p style={styles.footerText}>Logged in as:</p>
        <p style={styles.userName}>{user?.full_name || 'JMO'}</p>
        <span style={styles.roleLabel}>{user?.role || 'JMO'}</span>
        <button className="logout-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    backgroundColor: '#111217',
    color: '#ffffff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #23252f',
    boxSizing: 'border-box',
    textAlign: 'left',
  },
  logoArea: {
    padding: '30px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #23252f',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#a855f7',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#ffffff',
  },
  logoText: {
    fontWeight: '700',
    fontSize: '16px',
    letterSpacing: '1px',
  },
  nav: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexGrow: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: '#9ca3af',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: '#a855f7',
    color: '#ffffff',
  },
  linkIcon: {
    fontSize: '18px',
  },
  footer: {
    padding: '20px 24px',
    borderTop: '1px solid #23252f',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  footerText: {
    margin: 0,
    fontSize: '11px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  userName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#f9fafb',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  roleLabel: {
    fontSize: '12px',
    color: '#a855f7',
    fontWeight: '600',
  }
};

export default Sidebar;
