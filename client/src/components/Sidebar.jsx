import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user, onLogout }) {
  const isClerk = user?.role === 'Clerk';

  // SVG Icons
  const DashboardIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );

  const PatientsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const CasesIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const UsersIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'J';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div style={styles.sidebar}>
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          color: #4b5563;
          text-decoration: none;
          borderRadius: 8px;
          fontSize: 14px;
          fontWeight: 500;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          color: #4f46e5;
          background-color: rgba(79, 70, 229, 0.05);
        }
        .sidebar-link.active {
          background-color: #4f46e5;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justifyContent: center;
          border: 1px solid #f3f4f6;
          background-color: #ffffff;
          color: #ef4444;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .logout-btn:hover {
          background-color: #fef2f2;
          border-color: #fca5a5;
        }
      `}</style>

      {/* Logo Section */}
      <div style={styles.logoArea}>
        <div style={styles.logoIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div style={styles.logoText}>
          <div style={styles.mainTitle}>INVEX</div>
          <div style={styles.subTitle}>FORENSIC PORTAL</div>
        </div>
      </div>

      {/* Menu Navigation */}
      <div style={styles.navSection}>
        <div style={styles.navGroupTitle}>General Pages</div>
        <nav style={styles.nav}>
          <NavLink to="/" className="sidebar-link">
            <DashboardIcon /> Dashboard
          </NavLink>
          <NavLink to="/patients" className="sidebar-link">
            <PatientsIcon /> Patients List
          </NavLink>
          {!isClerk && (
            <NavLink to="/cases" className="sidebar-link">
              <CasesIcon /> Forensic Cases
            </NavLink>
          )}
        </nav>

        {user?.role === 'Admin' && (
          <>
            <div style={{ ...styles.navGroupTitle, marginTop: '20px' }}>Administration</div>
            <nav style={styles.nav}>
              <NavLink to="/users" className="sidebar-link">
                <UsersIcon /> User Management
              </NavLink>
              <NavLink to="/backups" className="sidebar-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Database Backups
              </NavLink>
            </nav>
          </>
        )}
      </div>

      {/* Footer Profile Area */}
      <div style={styles.footer}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {getInitials(user?.full_name)}
          </div>
          <div style={styles.profileDetails}>
            <div style={styles.userName}>{user?.full_name || 'Medical Officer'}</div>
            <div style={styles.roleLabel}>{user?.role || 'JMO / Specialist'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogoutIcon /> Sign Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    textAlign: 'left',
    boxShadow: '2px 0 8px rgba(0,0,0,0.01)',
  },
  logoArea: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #f3f4f6',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#4f46e5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  mainTitle: {
    fontWeight: '800',
    fontSize: '17px',
    color: '#111827',
    letterSpacing: '0.5px',
    lineHeight: '1.2',
  },
  subTitle: {
    fontWeight: '700',
    fontSize: '9px',
    color: '#9ca3af',
    letterSpacing: '1px',
    marginTop: '2px',
  },
  navSection: {
    padding: '24px 16px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navGroupTitle: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.75px',
    paddingLeft: '12px',
    marginBottom: '4px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  footer: {
    padding: '20px 16px',
    borderTop: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '38px',
    height: '38px',
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    border: '1px solid #c7d2fe',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginTop: '1px',
  }
};

export default Sidebar;
