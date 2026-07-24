import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role_id: '2' // Default to Doctor/JMO
  });

  const [formSubmitError, setFormSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get('/api/auth/users'),
        axios.get('/api/auth/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      if (rolesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, role_id: String(rolesRes.data[0].role_id) }));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users or roles:', err);
      setError(err.message || 'Failed to fetch users registry');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setTimeout(() => {
      setIsDrawerVisible(true);
    }, 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setFormSubmitError(null);
      setFormData(prev => ({
        full_name: '',
        username: '',
        password: '',
        role_id: roles.length > 0 ? String(roles[0].role_id) : '2'
      }));
    }, 300);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.username || !formData.password || !formData.role_id) {
      setFormSubmitError('All fields are required.');
      return;
    }
    setIsSubmitting(true);
    setFormSubmitError(null);

    axios.post('/api/auth/users', formData)
      .then(() => {
        setIsSubmitting(false);
        closeDrawer();
        fetchUsersAndRoles();
      })
      .catch((err) => {
        console.error('Error creating user:', err);
        setFormSubmitError(err.response?.data?.error || err.message || 'Failed to create user account');
        setIsSubmitting(false);
      });
  };

  // SVGs
  const AddIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <style>{`
        .premium-input {
          padding: 10px 14px;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background-color: #ffffff;
          color: #111827;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }
        .premium-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        .premium-btn-primary {
          background-color: #4f46e5;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .premium-btn-primary:hover:not(:disabled) {
          background-color: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .premium-btn-secondary {
          border: 1px solid #d1d5db;
          background-color: #ffffff;
          color: #374151;
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .premium-btn-secondary:hover {
          background-color: #f9fafb;
          border-color: #c7d2fe;
          color: #4f46e5;
        }
        .drawer-close-btn {
          border: none;
          background: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.2s;
        }
        .drawer-close-btn:hover {
          background-color: #f3f4f6;
          color: #111827;
        }
        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-admin {
          background-color: #fef3c7;
          color: #d97706;
        }
        .badge-jmo {
          background-color: #dbeafe;
          color: #2563eb;
        }
        .badge-clerk {
          background-color: #d1fae5;
          color: #059669;
        }
      `}</style>

      {/* Header Area */}
      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Create, manage, and monitor practitioner & administrative staff credentials.</p>
        </div>
        <button className="premium-btn-primary" onClick={openDrawer}>
          <AddIcon /> Create User Account
        </button>
      </header>

      {loading && <div style={styles.loading}>Loading user registry...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Check backend server.</div>}

      {/* Users Table Card */}
      {!loading && !error && (
        <section style={styles.tableCard}>
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                      No staff accounts configured.
                    </td>
                  </tr>
                ) : (
                  users.map((staff) => (
                    <tr key={staff.user_id}>
                      <td style={{ fontWeight: '600', color: '#4f46e5' }}>
                        #USR-{staff.user_id}
                      </td>
                      <td style={{ fontWeight: '500', color: '#111827' }}>{staff.full_name}</td>
                      <td><code>{staff.username}</code></td>
                      <td>
                        <span className={`role-badge ${
                          staff.role_name === 'Admin' ? 'badge-admin' : 
                          staff.role_name === 'Doctor/JMO' ? 'badge-jmo' : 'badge-clerk'
                        }`}>
                          {staff.role_name}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sliding Side Drawer Panel */}
      {isDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isDrawerVisible ? 'rgba(17, 24, 39, 0.4)' : 'rgba(17, 24, 39, 0)',
            backdropFilter: isDrawerVisible ? 'blur(4px)' : 'blur(0px)',
          }} 
          onClick={closeDrawer}
        >
          <div 
            style={{
              ...styles.drawer,
              transform: isDrawerVisible ? 'translateX(0)' : 'translateX(100%)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.drawerHeader}>
              <div>
                <h2 style={styles.drawerTitle}>Register New User</h2>
                <p style={styles.drawerSubtitle}>Create credentials for practitioners or clinic assistants.</p>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer}>
                <CloseIcon />
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
              <div style={styles.drawerBody}>
                {formSubmitError && <div style={styles.formError}>{formSubmitError}</div>}
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Dr. K. Perera"
                    className="premium-input"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Username *</label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. dr_perera"
                    className="premium-input"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Password *</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="••••••••"
                    className="premium-input"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>User Role *</label>
                  <select 
                    name="role_id" 
                    value={formData.role_id} 
                    onChange={handleInputChange} 
                    className="premium-input"
                  >
                    {roles.map(r => (
                      <option key={r.role_id} value={String(r.role_id)}>{r.role_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeDrawer}>
                  Cancel
                </button>
                <button type="submit" className="premium-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Account...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '32px 40px',
    fontFamily: 'var(--sans)',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    boxSizing: 'border-box',
    width: '100%',
    textAlign: 'left'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerText: {
    textAlign: 'left',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },
  loading: {
    padding: '24px',
    fontSize: '14px',
    color: '#6b7280',
  },
  error: {
    padding: '16px',
    fontSize: '14px',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    overflow: 'hidden',
    width: '100%'
  },
  bloodBadge: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '12px',
    border: '1px solid #fee2e2',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end',
    transition: 'all 0.3s ease-in-out',
  },
  drawer: {
    width: '450px',
    backgroundColor: '#ffffff',
    height: '100%',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drawerTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  drawerSubtitle: {
    margin: 0,
    fontSize: '12.5px',
    color: '#6b7280',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflow: 'hidden',
  },
  drawerBody: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    flexGrow: 1,
    overflowY: 'auto',
    textAlign: 'left'
  },
  formError: {
    padding: '12px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  drawerFooter: {
    padding: '20px 28px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#fafafa',
  }
};

export default UserManagement;
