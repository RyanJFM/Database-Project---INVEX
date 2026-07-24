import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PatientList({ user }) {
  const isAuthorized = user?.role === 'Admin' || user?.role === 'Doctor/JMO';

  const handleDeletePatient = (patientId, patientName) => {
    if (window.confirm(`Are you sure you want to delete patient "${patientName}" and all their associated forensic case records? This action cannot be undone.`)) {
      axios.delete(`/api/patients/${patientId}`)
        .then(() => {
          alert('Patient and all associated case records deleted successfully.');
          fetchPatients();
        })
        .catch((err) => {
          console.error('Error deleting patient:', err);
          alert(err.response?.data?.error || err.message || 'Failed to delete patient');
        });
    }
  };
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Drawer States
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
    }, 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setFormSubmitError(null);
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
        fetchPatients();
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
        .drawer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .drawer-scroll::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        .premium-btn-delete {
          border: 1px solid #fca5a5;
          background-color: #ffffff;
          color: #ef4444;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .premium-btn-delete:hover {
          background-color: #fef2f2;
          border-color: #ef4444;
        }
      `}</style>

      {/* Header Area */}
      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Patient Directory</h1>
          <p style={styles.subtitle}>Register and manage central medical files for forensic consultation.</p>
        </div>
        <button className="premium-btn-primary" onClick={openDrawer}>
          <AddIcon /> Register Patient
        </button>
      </header>

      {loading && <div style={styles.loading}>Loading clinical files...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Check backend server.</div>}

      {/* Patients Table Card */}
      {!loading && !error && (
        <section style={styles.tableCard}>
          <div className="table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>NIC</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>District</th>
                  <th>Blood Group</th>
                  <th>Address</th>
                  {isAuthorized && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                      No patient files registered in system.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td style={{ fontWeight: '600', color: '#4f46e5' }}>
                        #PAT-{patient.patient_id}
                      </td>
                      <td style={{ fontWeight: '500', color: '#111827' }}>{patient.full_name}</td>
                      <td>{patient.nic || '—'}</td>
                      <td>{formatDate(patient.dob)}</td>
                      <td>{patient.gender_name || '—'}</td>
                      <td>{patient.district_name || '—'}</td>
                      <td>
                        <span style={styles.bloodBadge}>{patient.blood_group_name || '—'}</span>
                      </td>
                      <td>{patient.address || '—'}</td>
                      {isAuthorized && (
                        <td>
                          <button 
                            className="premium-btn-delete"
                            onClick={() => handleDeletePatient(patient.patient_id, patient.full_name)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
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
                <h2 style={styles.drawerTitle}>Register New Patient</h2>
                <p style={styles.drawerSubtitle}>Create a centralized demographic file first.</p>
              </div>
              <button className="drawer-close-btn" onClick={closeDrawer}>
                <CloseIcon />
              </button>
            </div>

            {/* Form Container */}
            <form onSubmit={handleFormSubmit} style={styles.formContainer}>
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
                    placeholder="e.g. Saman Fernando"
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
                      placeholder="e.g. 198512345678"
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
                    placeholder="Enter resident address..."
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
                  style={{ minWidth: '130px', justifyContent: 'center' }}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
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
    textAlign: 'left',
  },
  error: {
    padding: '16px',
    fontSize: '14px',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
    textAlign: 'left',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #f0f0f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  trHead: {
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #f0f0f0',
  },
  tr: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s',
  },
  th: {
    padding: '14px 20px',
    fontWeight: '600',
    textAlign: 'left',
    color: '#4b5563',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '16px 20px',
    fontSize: '14px',
    color: '#4b5563',
  },
  bloodBadge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #e5e7eb',
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
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e5e7eb',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  drawerHeader: {
    padding: '24px 30px',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  drawerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#6b7280',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 91px)',
    margin: 0,
  },
  drawerBody: {
    padding: '30px',
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
    color: '#374151',
  },
  drawerFooter: {
    padding: '20px 30px',
    borderTop: '1px solid #f3f4f6',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#fafafa',
  },
  formError: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '13px',
    lineHeight: '1.4',
  }
};

export default PatientList;
