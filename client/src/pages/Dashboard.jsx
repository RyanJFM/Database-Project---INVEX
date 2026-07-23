import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [data, setData] = useState({
    stats: {
      totalPatients: 0,
      activeCases: 0,
      completedAutopsies: 0,
      pendingReports: 0
    },
    recentCases: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backup Plan States
  const [backupPlan, setBackupPlan] = useState('disabled');
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(null);

  // Manual Backup States
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);

  useEffect(() => {
    // Fetch stats
    axios.get('/api/dashboard/stats')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to fetch dashboard statistics');
        setLoading(false);
      });

    // Fetch active backup plan
    axios.get('/api/dashboard/backup-plan')
      .then((res) => {
        setBackupPlan(res.data.plan);
      })
      .catch((err) => {
        console.error('Error fetching backup plan:', err);
      });
  }, []);

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    setPlanSubmitting(true);
    setPlanSuccess(null);

    axios.post('/api/dashboard/backup-plan', { plan: backupPlan })
      .then((res) => {
        setPlanSubmitting(false);
        setPlanSuccess('Backup schedule updated successfully!');
        setTimeout(() => setPlanSuccess(null), 3000);
      })
      .catch((err) => {
        setPlanSubmitting(false);
        console.error('Failed to update plan:', err);
        alert(err.response?.data?.error || 'Failed to update backup plan');
      });
  };

  const handleBackupNow = () => {
    setBackingUp(true);
    setBackupSuccess(null);

    axios.post('/api/dashboard/backup-now')
      .then((res) => {
        setBackingUp(false);
        setBackupSuccess('Secure database backup created successfully!');
        setTimeout(() => setBackupSuccess(null), 4000);
      })
      .catch((err) => {
        setBackingUp(false);
        console.error('Failed to run backup:', err);
        alert(err.response?.data?.error || 'Manual backup execution failed');
      });
  };

  // SVG Icons for stats cards
  const PatientsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const ActiveCasesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );

  const AutopsiesIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );

  const ReportsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const stats = [
    { 
      label: 'Total Patients', 
      value: data.stats.totalPatients.toLocaleString(), 
      color: '#10b981', 
      bgColor: 'rgba(16, 185, 129, 0.08)',
      icon: <PatientsIcon />
    },
    { 
      label: 'Active Forensic Cases', 
      value: data.stats.activeCases.toLocaleString(), 
      color: '#f59e0b', 
      bgColor: 'rgba(245, 158, 11, 0.08)',
      icon: <ActiveCasesIcon />
    },
    { 
      label: 'Completed Autopsies', 
      value: data.stats.completedAutopsies.toLocaleString(), 
      color: '#3b82f6', 
      bgColor: 'rgba(59, 130, 246, 0.08)',
      icon: <AutopsiesIcon />
    },
    { 
      label: 'Pending Reports', 
      value: data.stats.pendingReports.toLocaleString(), 
      color: '#ef4444', 
      bgColor: 'rgba(239, 68, 68, 0.08)',
      icon: <ReportsIcon />
    },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>System Analytics</h1>
        <p style={styles.subtitle}>Welcome to the Judicial Medical Officer (JMO) portal. Overview of statistics and operations.</p>
      </header>

      {loading && <div style={styles.loading}>Loading analytics summary...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Check backend server status.</div>}

      {!loading && !error && (
        <>
          {/* Dashboard Stats Cards */}
          <section style={styles.grid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardLabel}>{stat.label}</span>
                  <div style={{ ...styles.iconContainer, color: stat.color, backgroundColor: stat.bgColor }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={styles.cardValue}>{stat.value}</div>
              </div>
            ))}
          </section>

          {/* Bottom Grid: Recent Activity & System Controls */}
          <div style={styles.bottomGrid}>
            
            {/* Recent Activity Table */}
            <section style={styles.recentSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Recent Case Activity</h2>
                <span style={styles.tableSubtitle}>Latest 5 medico-legal cases logged</span>
              </div>
              <div className="table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Case ID</th>
                      <th>Patient</th>
                      <th>Police Station</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentCases.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                          No recent case activity logged.
                        </td>
                      </tr>
                    ) : (
                      data.recentCases.map((c) => (
                        <tr key={c.case_id}>
                          <td style={{ fontWeight: '600', color: '#4f46e5' }}>#FC-{c.case_id}</td>
                          <td style={{ fontWeight: '500', color: '#111827' }}>{c.patient_name || 'Unknown'}</td>
                          <td>{c.station_name || 'N/A'}</td>
                          <td>{c.case_type_name || 'N/A'}</td>
                          <td>
                            <span style={{ 
                              ...styles.statusBadge, 
                              ...(c.case_status_name === 'Open' ? styles.badgeOpen : 
                                  c.case_status_name === 'Closed' ? styles.badgeClosed : 
                                  styles.badgePending) 
                            }}>
                              {c.case_status_name}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* System Control Center (Backup Config) */}
            <section style={styles.maintenanceCard}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>System Maintenance</h2>
                <span style={styles.tableSubtitle}>Configure active database backups</span>
              </div>

              <form onSubmit={handleUpdatePlan} style={styles.maintenanceForm}>
                <div style={styles.formGroup}>
                  <label style={styles.maintenanceLabel}>Backup Schedule Frequency</label>
                  <select 
                    value={backupPlan} 
                    onChange={(e) => setBackupPlan(e.target.value)} 
                    className="premium-input"
                    disabled={backupPlan === 'windows_scheduler'}
                    style={{ cursor: backupPlan === 'windows_scheduler' ? 'not-allowed' : 'pointer' }}
                  >
                    <option value="disabled">Disabled (Manual Only)</option>
                    <option value="daily">Daily at Midnight</option>
                    <option value="twice_daily">Twice Daily (12-hour cycle)</option>
                    <option value="weekly">Weekly (Sunday Midnight)</option>
                    {backupPlan === 'windows_scheduler' && (
                      <option value="windows_scheduler">Managed by Windows OS</option>
                    )}
                  </select>
                </div>

                {backupPlan === 'windows_scheduler' ? (
                  <p style={styles.infoText}>
                    Backups are controlled externally via Windows Task Scheduler.
                  </p>
                ) : (
                  <button type="submit" disabled={planSubmitting} className="premium-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {planSubmitting ? 'Updating Scheduler...' : 'Save Plan Settings'}
                  </button>
                )}
                {planSuccess && <div style={styles.successMessage}>{planSuccess}</div>}
              </form>

              <div style={styles.divider}></div>

              <div style={styles.actionBlock}>
                <h4 style={styles.maintenanceHeading}>On-Demand Backup</h4>
                <p style={styles.infoText}>Create an immediate AES-256 encrypted archive snapshot of JMO databases.</p>
                
                <button 
                  type="button" 
                  onClick={handleBackupNow} 
                  disabled={backingUp} 
                  className="premium-btn-secondary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  {backingUp ? 'Archiving Database...' : 'Run Backup Now'}
                </button>

                {backupSuccess && <div style={styles.successMessage}>{backupSuccess}</div>}
              </div>
            </section>

          </div>
        </>
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
  },
  header: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  cardLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: '0.25px',
  },
  iconContainer: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: '30px',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
    lineHeight: '1.2',
  },
  bottomGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    width: '100%',
  },
  recentSection: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
    flex: 2,
    minWidth: '450px',
  },
  maintenanceCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
    flex: 1,
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  maintenanceForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  maintenanceLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  maintenanceHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoText: {
    fontSize: '12.5px',
    color: '#6b7280',
    lineHeight: '1.4',
    margin: '0 0 12px 0',
  },
  successMessage: {
    padding: '10px 12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#047857',
    borderRadius: '6px',
    fontSize: '12.5px',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '10px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#f3f4f6',
    margin: '4px 0',
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeader: {
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  tableSubtitle: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeOpen: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  badgeClosed: {
    backgroundColor: '#d1fae5',
    color: '#059669',
  },
  badgePending: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
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
  }
};

export default Dashboard;
