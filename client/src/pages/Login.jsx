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

    axios.post('http://localhost:5000/api/auth/login', { username, password })
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

  return (
    <div style={styles.container}>
      <style>{`
        .login-input {
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
        .login-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }
        .login-input:hover {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .login-btn {
          border: none;
          background-color: var(--accent);
          color: #ffffff;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px var(--accent-bg);
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .credentials-card {
          margin-top: 24px;
          background-color: var(--bg);
          border: 1px dashed var(--border);
          border-radius: 10px;
          padding: 16px;
        }
        .credentials-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-h);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .credentials-list {
          font-size: 12px;
          color: var(--text);
          line-height: 1.6;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>I</div>
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
              placeholder="Enter your username"
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
          <div className="credentials-title">🔑 Test Credentials (seeded)</div>
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
    backgroundColor: 'var(--bg)',
  },
  card: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: 'var(--shadow)',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    backgroundColor: '#a855f7',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '24px',
    color: '#ffffff',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: 'var(--text-h)',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px',
  },
  subtitle: {
    margin: 0,
    color: 'var(--text)',
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-h)',
  },
  errorBanner: {
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13.5px',
    lineHeight: '1.4',
  }
};

export default Login;
