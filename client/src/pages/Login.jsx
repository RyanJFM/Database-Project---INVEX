import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError(null);

    axios.post('/api/auth/login', { username, password })
      .then((res) => {
        setLoading(false);
        // Save session
        localStorage.setItem('invex_session', JSON.stringify(res.data));
        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.');
        setLoading(false);
      });
  };

  // SVGs
  const ShieldIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const KeyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );

  return (
    <div style={styles.container}>
      <style>{`
        .login-input {
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
        .login-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }
        .login-btn {
          border: none;
          background-color: #4f46e5;
          color: #ffffff;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(79, 70, 229, 0.15);
        }
        .login-btn:hover:not(:disabled) {
          background-color: #4338ca;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .credentials-card {
          margin-top: 24px;
          background-color: #fafafa;
          border: 1px dashed #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }
        .credentials-title {
          font-size: 11px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .credentials-list {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.6;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>
            <ShieldIcon />
          </div>
          <h1 style={styles.title}>INVEX FORENSIC</h1>
          <p style={styles.subtitle}>Secured Medico-Legal Database System</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBanner}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter username"
              required 
              className="login-input"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              className="login-input"
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="credentials-card">
          <div className="credentials-title">
            <KeyIcon /> Test Credentials (seeded)
          </div>
          <div className="credentials-list">
            • <b>Admin:</b> admin / hashed_pw_123<br />
            • <b>JMO:</b> dr_wickrama / hashed_pw_456<br />
            • <b>Clerk:</b> clerk_nimal / hashed_pw_789
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fafafa',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '24px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    backgroundColor: '#4f46e5',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px',
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
  errorBanner: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '13px',
    lineHeight: '1.4',
  }
};

export default Login;
