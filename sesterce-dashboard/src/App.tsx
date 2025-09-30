import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import WarningBanner from './components/common/WarningBanner';
import GPUSuperclusterCalculatorV5Enhanced from './components/GPUSuperclusterCalculatorV5Enhanced';
import { Login } from './components/Login';
import './styles/null-sector-theme.css';

interface AppContentProps {
  onLogout: () => void;
  currentUser: string;
}

function AppContent({ onLogout, currentUser }: AppContentProps) {

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements - very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <Header onLogout={onLogout} currentUser={currentUser} />
      
      <main className="pt-16 relative z-10">
        {/* Warning Banner - aligned with content */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <WarningBanner
            title="Active Session"
            message="Cluster configuration changes are tracked and audited for compliance."
          />
        </div>

        {/* Main Content - Only Calculator */}
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<GPUSuperclusterCalculatorV5Enhanced />} />
            <Route path="/calculator" element={<GPUSuperclusterCalculatorV5Enhanced />} />
            <Route path="/pricing" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const user = sessionStorage.getItem('nullSectorUser');
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    sessionStorage.setItem('nullSectorUser', username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    // Clear all authentication data
    sessionStorage.removeItem('nullSectorUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppContent onLogout={handleLogout} currentUser={currentUser} />
    </Router>
  );
}

export default App;