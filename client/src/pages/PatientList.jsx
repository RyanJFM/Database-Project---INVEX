import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Drawer States for smooth slide-in transition
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    nic: '',
    dob: '',
    gender_id: '1',
    district_id: '2', // Default to Colombo
    marital_status_id: '1',
    blood_group_id: '1',
    address: ''
  });

  const [formSubmitError, setFormSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = () => {
    setLoading(true);
    axios.get('/api/patients')
      .then((response) => {
        setPatients(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching patients:', err);
        setError(err.message || 'Failed to fetch patients');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setTimeout(() => {
      setIsDrawerVisible(true);
    }, 10); // small delay to trigger CSS transition
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setFormSubmitError(null);
    }, 300); // matching the transition duration
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
    if (!formData.full_name) {
      setFormSubmitError('Full name is required.');
      return;
    }
    setIsSubmitting(true);
    setFormSubmitError(null);

    axios.post('/api/patients', formData)
      .then(() => {
        setIsSubmitting(false);
        closeDrawer();
        // Clear form
        setFormData({
          full_name: '',
          nic: '',
          dob: '',
          gender_id: '1',
          district_id: '2',
          marital_status_id: '1',
          blood_group_id: '1',
          address: ''
        });
        fetchPatients(); // Re-fetch the updated list
      })
      .catch((err) => {
        console.error('Error creating patient:', err);
        setFormSubmitError(err.response?.data?.details || err.message || 'Failed to register patient');
        setIsSubmitting(false);
      });
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const date = new Date(dateVal);
      if (isNaN(date.getTime())) return String(dateVal);
      return date.toLocaleDateString();
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div style={styles.container}>
      {/* Dynamic CSS Styles Injection for Interactive Hover/Focus/Transitions */}
      <style>{`
        .premium-input {
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background-color: var(--bg);
          color: var(--text-h);
          font-size: 14px;
          outline: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-sizing: border-box;
        }
        .premium-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }
        .premium-input:hover {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .premium-btn-primary {
          background-color: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .premium-btn-primary:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--accent-bg);
        }
        .premium-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }
        .premium-btn-secondary {
          border: 1px solid var(--border);
          background-color: transparent;
          color: var(--text-h);
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .premium-btn-secondary:hover {
          background-color: var(--border);
          color: var(--text-h);
        }
        .drawer-close-btn {
          border: none;
          background: none;
          font-size: 24px;
          color: var(--text);
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: all 0.2s;
        }
        .drawer-close-btn:hover {
          background-color: var(--border);
          color: var(--text-h);
        }
        /* Custom Scrollbar for Drawer Body */
        .drawer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--text);
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Patient Directory</h1>
          <p style={styles.subtitle}>View, manage, and register patients in the system.</p>
        </div>
        <button className="premium-btn-primary" onClick={openDrawer}>
          <span>+</span> Register Patient
        </button>
      </header>

      {loading && <div style={styles.loading}>Loading patient records...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Make sure the backend server is running and database tables exist.</div>}

      {!loading && !error && (
        <section style={styles.tableCard}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tr}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>NIC</th>
                  <th style={styles.th}>Date of Birth</th>
                  <th style={styles.th}>Gender</th>
                  <th style={styles.th}>District</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Address</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr style={styles.tr}>
                    <td colSpan="8" style={{ ...styles.td, textAlign: 'center', color: 'var(--text)' }}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.patient_id} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 'bold' }}>
                        #PAT-{patient.patient_id}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '500' }}>{patient.full_name}</td>
                      <td style={styles.td}>{patient.nic || 'N/A'}</td>
                      <td style={styles.td}>{formatDate(patient.dob)}</td>
                      <td style={styles.td}>{patient.gender_name || 'N/A'}</td>
                      <td style={styles.td}>{patient.district_name || 'N/A'}</td>
                      <td style={styles.td}>{patient.blood_group_name || 'N/A'}</td>
                      <td style={styles.td}>{patient.address || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Sliding Side-Panel (Drawer) */}
      {isDrawerOpen && (
        <div 
          style={{
            ...styles.drawerOverlay,
            backgroundColor: isDrawerVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: isDrawerVisible ? 'blur(8px)' : 'blur(0px)',
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
                <h2 style={styles.drawerTitle}>Register New Patient</h2>
                <p style={styles.drawerSubtitle}>Create a new clinical medical record entry.</p>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer}>&times;</button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
              {/* Scrollable body */}
              <div className="drawer-scroll" style={styles.drawerBody}>
                {formSubmitError && <div style={styles.formError}>{formSubmitError}</div>}
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input 
                    type="text" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. John Doe"
                    className="premium-input"
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>NIC Number</label>
                    <input 
                      type="text" 
                      name="nic" 
                      value={formData.nic} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 199012345678"
                      className="premium-input"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gender</label>
                    <select 
                      name="gender_id" 
                      value={formData.gender_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Male</option>
                      <option value="2">Female</option>
                      <option value="3">Unknown</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>District</label>
                    <select 
                      name="district_id" 
                      value={formData.district_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Kandy</option>
                      <option value="2">Colombo</option>
                      <option value="3">Kurunegala</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Marital Status</label>
                    <select 
                      name="marital_status_id" 
                      value={formData.marital_status_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">Single</option>
                      <option value="2">Married</option>
                      <option value="3">Divorced</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Blood Group</label>
                    <select 
                      name="blood_group_id" 
                      value={formData.blood_group_id} 
                      onChange={handleInputChange} 
                      className="premium-input"
                    >
                      <option value="1">A+</option>
                      <option value="2">O+</option>
                      <option value="3">B-</option>
                      <option value="4">Unknown</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <textarea 
                    name="address" 
                    rows="3" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="Enter resident address details..."
                    className="premium-input"
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  ></textarea>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={styles.drawerFooter}>
                <button type="button" className="premium-btn-secondary" onClick={closeDrawer}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="premium-btn-primary"
                  style={{ minWidth: '150px', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Registering...' : 'Register Patient'}
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
    padding: '40px',
    fontFamily: 'var(--sans)',
    color: 'var(--text-h)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: 0,
    color: 'var(--text)',
    fontSize: '16px',
  },
  loading: {
    padding: '20px',
    fontSize: '16px',
    color: 'var(--text)',
    textAlign: 'left',
  },
  error: {
    padding: '20px',
    fontSize: '15px',
    color: '#ef4444',
    backgroundColor: 'var(--accent-bg)',
    borderRadius: '8px',
    border: '1px solid var(--accent-border)',
    textAlign: 'left',
    lineHeight: '1.6',
  },
  tableCard: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    textAlign: 'left',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
  },
  th: {
    padding: '12px 16px',
    fontWeight: '600',
    textAlign: 'left',
    color: 'var(--text)',
    fontSize: '14px',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text-h)',
  },
  drawerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  drawer: {
    width: '100%',
    maxWidth: '520px',
    height: '100%',
    backgroundColor: 'var(--card-bg)',
    borderLeft: '1px solid var(--border)',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-h)',
  },
  drawerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: 'var(--text)',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 93px)', // dynamic height offset for header
    margin: 0,
  },
  drawerBody: {
    padding: '24px',
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'left',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  drawerFooter: {
    padding: '20px 24px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: 'var(--card-bg)',
  },
  formError: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.4',
  }
};

export default PatientList;
