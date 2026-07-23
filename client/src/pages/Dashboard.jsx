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

  useEffect(() => {
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
  }, []);

  const stats = [
    { label: 'Total Patients', value: data.stats.totalPatients.toLocaleString(), color: '#4caf50' },
    { label: 'Active Forensic Cases', value: data.stats.activeCases.toLocaleString(), color: '#ff9800' },
    { label: 'Completed Autopsies', value: data.stats.completedAutopsies.toLocaleString(), color: '#2196f3' },
    { label: 'Pending Reports', value: data.stats.pendingReports.toLocaleString(), color: '#f44336' },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>INVEX Forensic System</h1>
        <p style={styles.subtitle}>Welcome to the Judicial Medical Officer (JMO) dashboard.</p>
      </header>

      {loading && <div style={styles.loading}>Loading dashboard analytics...</div>}
      {error && <div style={styles.error}>Connection Error: {error}. Make sure the backend server is running and database tables exist.</div>}

      {!loading && !error && (
        <>
          <section style={styles.grid}>
            {stats.map((stat, index) => (
              <div key={index} style={styles.card}>
                <div style={{ ...styles.cardColorBar, backgroundColor: stat.color }}></div>
                <h3 style={styles.cardLabel}>{stat.label}</h3>
                <div style={styles.cardValue}>{stat.value}</div>
              </div>
            ))}
          </section>

          <section style={styles.recentSection}>
            <h2 style={styles.sectionTitle}>Recent Case Activity</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Case ID</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Police Station</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentCases.length === 0 ? (
                    <tr style={styles.tr}>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: 'var(--text)' }}>
                        No recent case activity logged.
                      </td>
                    </tr>
                  ) : (
                    data.recentCases.map((c) => (
                      <tr key={c.case_id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 'bold' }}>#FC-{c.case_id}</td>
                        <td style={{ ...styles.td, fontWeight: '500' }}>{c.patient_name || 'Unknown'}</td>
                        <td style={styles.td}>{c.station_name || 'N/A'}</td>
                        <td style={styles.td}>{c.case_type_name || 'N/A'}</td>
                        <td style={{ 
                          ...styles.td, 
                          ...(c.case_status_name === 'Open' ? styles.statusActive : 
                              c.case_status_name === 'Closed' ? styles.statusCompleted : 
                              styles.statusPending) 
                        }}>
                          {c.case_status_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
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
    textAlign: 'left',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
    transition: 'transform 0.2s ease',
  },
  cardColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '5px',
  },
  cardLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text)',
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-h)',
  },
  recentSection: {
    backgroundColor: 'var(--card-bg, #ffffff)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: 'var(--shadow)',
    textAlign: 'left',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: '600',
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
  statusActive: {
    color: '#ff9800',
    fontWeight: '600',
  },
  statusCompleted: {
    color: '#4caf50',
    fontWeight: '600',
  },
  statusPending: {
    color: '#2196f3',
    fontWeight: '600',
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
  }
};

export default Dashboard;
