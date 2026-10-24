import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, X, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About UDPAD', href: '/#about' },
    { label: 'Government Schemes', href: '/schemes' },
    { label: 'Help & Support', href: '/help' }
  ];

  return (
    <header className="bg-white border-b border-gov-border shadow-xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none p-1">
            <img
              src="/udpad-logo.png"
              alt="UDPAD Emblem Logo"
              className="w-12 h-12 sm:w-13 sm:h-13 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-primary-navy">
                UDPAD
              </span>
              <span className="text-xs text-gov-muted font-medium hidden sm:block">
                Unified Digital Platform for Accessible Public Documentation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-gov-blue ${
                  location.pathname === link.href ? 'text-gov-blue font-semibold border-b-2 border-gov-blue pb-1' : 'text-gov-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action: Login / Dashboard */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in')) ? '/officer' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gov-blue text-white text-sm font-medium hover:bg-gov-blue-dark transition-colors shadow-xs"
              >
                {user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in')) ? 'Officer Console' : 'Go to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded text-sm font-medium text-gov-text hover:text-gov-blue hover:bg-slate-50 transition-colors"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary-navy text-white text-sm font-medium hover:bg-gov-blue transition-colors shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gov-muted hover:text-gov-text hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gov-border bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gov-text hover:bg-slate-50 hover:text-gov-blue"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-gov-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in')) ? '/officer' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded bg-gov-blue text-white font-medium text-sm"
              >
                {user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in')) ? 'Officer Console' : 'Go to Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded bg-primary-navy text-white font-medium text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded border border-gov-border text-gov-text font-medium text-sm hover:bg-slate-50"
                >
                  Register as a Citizen
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
