import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import './styles/null-sector-theme.css';

// Lazy load the calculator for better performance
const GPUSuperclusterCalculatorV5Enhanced = React.lazy(() => import('./components/GPUSuperclusterCalculatorV5Enhanced'));

function AppContent() {

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements - very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <main className="relative z-10">
        {/* Main Content - Only Calculator */}
        <div className="min-h-screen">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading NullSector TCO Calculator...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<GPUSuperclusterCalculatorV5Enhanced />} />
              <Route path="/calculator" element={<GPUSuperclusterCalculatorV5Enhanced />} />
              <Route path="/pricing" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const user = sessionStorage.getItem('nullSectorUser');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('nullSectorUser', username);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;