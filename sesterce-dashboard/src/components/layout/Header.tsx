import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Container } from './Container';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-gray-200 dark:border-dark-border">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center gap-3">
              <img 
                src="/sesterce.jpg" 
                alt="Sesterce" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-gpu-purple bg-clip-text text-transparent">
                Sesterce
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/cloud" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Cloud
            </a>
            <a href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Pricing
            </a>
            <a href="/datacenters" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Datacenters
            </a>
            <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              About
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">Sign In</Button>
            <Button variant="primary" size="sm">Get Started</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border">
            <div className="px-4 py-6 space-y-4">
              <a href="/cloud" className="block py-2 text-gray-700 dark:text-gray-300">Cloud</a>
              <a href="/pricing" className="block py-2 text-gray-700 dark:text-gray-300">Pricing</a>
              <a href="/datacenters" className="block py-2 text-gray-700 dark:text-gray-300">Datacenters</a>
              <a href="/about" className="block py-2 text-gray-700 dark:text-gray-300">About</a>
              <div className="pt-4 space-y-2">
                <Button variant="outline" fullWidth>Sign In</Button>
                <Button variant="primary" fullWidth>Get Started</Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};
