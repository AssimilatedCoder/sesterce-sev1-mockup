import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { TabNavigation } from './components/features/TabNavigation';
import { GrafanaDashboardOriginal } from './components/features/GrafanaDashboardOriginal';
import GPUSuperclusterCalculatorV5Enhanced from './components/GPUSuperclusterCalculatorV5Enhanced';
import { Login } from './components/Login';
import { Activity, Calculator } from 'lucide-react';
import './styles/null-sector-theme.css';

interface AppContentProps {
  onLogout: () => void;
  currentUser: string;
}

function AppContent({ onLogout, currentUser }: AppContentProps) {
  const location = useLocation();
  const activeTab = location.pathname === '/calculator' ? 'calculator' : 'dashboard';

  const tabs = [
    {
      id: 'dashboard',
      label: 'SEV-1 War Room',
      icon: <Activity className="w-5 h-5" />,
      path: '/'
    },
    {
      id: 'calculator',
      label: 'GPU SuperCluster Calculator',
      icon: <Calculator className="w-5 h-5" />,
      path: '/calculator'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements - very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <Header onLogout={onLogout} currentUser={currentUser} />
      
      <main className="pt-16 relative z-10">
        {/* Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-40 shadow-sm">
          <Container>
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
            />
          </Container>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<GrafanaDashboardOriginal />} />
            <Route path="/calculator" element={<GPUSuperclusterCalculatorV5Enhanced />} />
            <Route path="/pricing" element={<Navigate to="/calculator" replace />} />
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
    sessionStorage.removeItem('nullSectorUser');
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