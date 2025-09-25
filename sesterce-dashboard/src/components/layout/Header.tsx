import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Container } from './Container';

interface HeaderProps {
  onLogout: () => void;
  currentUser: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-black border-b border-gray-800 shadow-lg">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo and Company Name */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-4">
              <img 
                src="/testlogo.png" 
                alt="Null Sector Systems LTD" 
                className="h-12 w-auto object-contain"
              />
              <h1 
                className="text-xl font-bold"
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 700,
                  color: '#ff6b35',
                  textShadow: '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)',
                  letterSpacing: '0.5px'
                }}
              >
                NULL SECTOR SYSTEMS
              </h1>
            </a>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 text-sm text-white">
              <User className="w-4 h-4" />
              <span>{currentUser}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white hover:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-700 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-2 text-sm text-white pb-3 border-b border-gray-700">
                <User className="w-4 h-4" />
                <span>Signed in as {currentUser}</span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
