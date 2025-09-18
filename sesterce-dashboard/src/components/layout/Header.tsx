import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Container } from './Container';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img 
                src="/sesterce.jpg" 
                alt="Sesterce" 
                className="h-12 w-auto object-contain"
              />
            </a>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200">
            <div className="px-4 py-6">
              {/* Mobile menu is empty since we removed navigation items */}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
