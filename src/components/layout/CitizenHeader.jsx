import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  FolderOpen,
  FileCheck2,
  History,
  AlertTriangle,
  Scale,
  Bell,
  HelpCircle,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CitizenHeader = () => {
  const { user, logout, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Records', path: '/records', icon: FolderOpen },
    { label: 'Schemes', path: '/schemes', icon: FileCheck2 },
    { label: 'Applications', path: '/applications', icon: FileText },
    { label: 'Benefit History', path: '/benefit-history', icon: History },
    { label: 'Verification Alerts', path: '/verification-alerts', icon: AlertTriangle, hasAlertDot: true },
    { label: 'Corrections', path: '/corrections', icon: Scale },
    { label: 'Help', path: '/help', icon: HelpCircle }
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gov-border shadow-xs sticky top-0 z-40">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Brand */}
          <Link
            to={user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in')) ? '/officer' : '/dashboard'}
            className="flex items-center gap-3 group outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none p-1"
          >
            <img
              src="/udpad-logo.png"
              alt="UDPAD Emblem Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="font-extrabold text-xl tracking-tight text-primary-navy">
                UDPAD
              </span>
              <p className="text-[11px] text-gov-muted hidden sm:block">
                Unified Digital Platform for Accessible Public Documentation
              </p>
            </div>
          </Link>

          {/* Right Citizen Tools: Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Officer Console Direct Button */}
            {Boolean(user?.role === 'OFFICER' || (user?.email && user.email.toLowerCase().endsWith('@gov.in'))) && (
              <Link
                to="/officer"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Officer Console</span>
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-gov-muted hover:text-gov-text hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue"
              title="View Notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gov-border hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-blue text-left"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user?.fullName ? user.fullName.charAt(0) : 'C'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-gov-text leading-tight max-w-[130px] truncate">
                    {user?.fullName || 'Citizen User'}
                  </div>
                  <div className="text-[10px] text-gov-muted leading-tight font-mono">
                    {user?.citizenId || 'CIT-DEMO'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gov-muted" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gov-border py-2 z-50">
                  <div className="px-4 py-2 border-b border-gov-border">
                    <p className="text-xs text-gov-muted">Signed in as Citizen</p>
                    <p className="text-sm font-semibold text-gov-text truncate">{user?.fullName}</p>
                    <p className="text-xs font-mono text-gov-muted mt-0.5">ID: {user?.citizenId}</p>
                    <p className="text-xs font-mono text-gov-muted">Household: {user?.householdId}</p>
                  </div>

                  <Link
                    to="/records"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gov-text hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-gov-muted" />
                    My Profile & Family Records
                  </Link>

                  <Link
                    to="/help"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-gov-text hover:bg-slate-50"
                  >
                    <HelpCircle className="w-4 h-4 text-gov-muted" />
                    Help & FAQs
                  </Link>

                  <div className="border-t border-gov-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-700 hover:bg-red-50 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      Sign Out (Clear Demo Session)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
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
      </div>

      {/* Main Citizen Navigation Bar (Desktop) */}
      <div className="hidden md:block bg-[#123B66] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 overflow-x-auto py-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t transition-colors whitespace-nowrap relative ${
                    active
                      ? 'bg-white text-primary-navy shadow-xs font-bold border-t-2 border-amber-500'
                      : 'text-slate-100 hover:bg-[#1a4a7d] hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary-navy' : 'text-slate-300'}`} />
                  {item.label}
                  {item.hasAlertDot && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gov-border px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium ${
                  active ? 'bg-blue-50 text-gov-blue font-bold border-l-4 border-gov-blue' : 'text-gov-text hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gov-muted" />
                  {item.label}
                </div>
                {item.hasAlertDot && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                    Action
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gov-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-medium rounded"
            >
              <LogOut className="w-4 h-4" />
              Sign Out (Demo Session)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
