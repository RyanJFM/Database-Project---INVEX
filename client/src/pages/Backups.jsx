import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Backups() {
  // Backup Plan States
  const [backupPlan, setBackupPlan] = useState('disabled');
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planSuccess, setPlanSuccess] = useState(null);

  // Manual Backup States
  const [backingUp, setBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active backup plan
    axios.get('/api/dashboard/backup-plan')
      .then((res) => {
        setBackupPlan(res.data.plan);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching backup plan:', err);
        setLoading(false);
      });
  }, []);

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    setPlanSubmitting(true);
    setPlanSuccess(null);

    axios.post('/api/dashboard/backup-plan', { plan: backupPlan })
      .then(() => {
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
      .then(() => {
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
      `}</style>

      {/* Header Area */}
      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Database Maintenance</h1>
          <p style={styles.subtitle}>Configure automated snapshots and execute manual AES-256 encrypted database archives.</p>
        </div>
      </header>

      {loading ? (
        <div style={styles.loading}>Loading configurations...</div>
      ) : (
        <div style={styles.contentGrid}>
          {/* Section 1: Backup Scheduler */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>Automated Backup Scheduler</h2>
              <p style={styles.infoText}>Schedule periodic system snapshots. On Linux, this integrates directly with the system Crontab.</p>
            </div>

            <form onSubmit={handleUpdatePlan} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Backup Schedule Frequency</label>
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
                <div style={styles.alertBox}>
                  Backups are controlled externally via Windows Task Scheduler.
                </div>
              ) : (
                <button type="submit" disabled={planSubmitting} className="premium-btn-primary">
                  {planSubmitting ? 'Updating Scheduler...' : 'Save Plan Settings'}
                </button>
              )}
              {planSuccess && <div style={styles.successMessage}>{planSuccess}</div>}
            </form>
          </section>

          {/* Section 2: On-Demand Backup */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.sectionTitle}>On-Demand Backup</h2>
              <p style={styles.infoText}>Create an immediate secure archive snapshot of the INVEX forensic database (MySQL/SQLite) and apply AES-256 encryption.</p>
            </div>

            <div style={styles.actionBlock}>
              <button 
                type="button" 
                onClick={handleBackupNow} 
                disabled={backingUp} 
                className="premium-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
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
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    alignItems: 'start',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },
  infoText: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  alertBox: {
    padding: '12px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '13px',
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
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }
};

export default Backups;
