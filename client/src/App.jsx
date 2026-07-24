import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import CaseManagement from './pages/CaseManagement';
import UserManagement from './pages/UserManagement';
import Backups from './pages/Backups';
import Login from './pages/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('invex_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem('invex_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('invex_session');
    setUser(null);
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={styles.layout}>
      <Sidebar user={user} onLogout={handleLogout} />
      <main style={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<PatientList user={user} />} />
          <Route path="/cases" element={<CaseManagement user={user} />} />
          <Route path="/users" element={user?.role === 'Admin' ? <UserManagement /> : <Dashboard />} />
          <Route path="/backups" element={user?.role === 'Admin' ? <Backups /> : <Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  mainContent: {
    flexGrow: 1,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--bg)',
  },
  loadingScreen: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
    fontSize: '16px'
  }
};

export default App;
