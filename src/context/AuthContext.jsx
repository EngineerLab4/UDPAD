import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { mockDataService } from '../services/mockDataService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = () => {
    try {
      const notifs = mockDataService.getNotifications();
      const count = notifs.filter((n) => !n.read).length;
      setUnreadCount(count);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Restore session on page load/refresh
    const sessionUser = authService.getCurrentSession();
    if (sessionUser) {
      setUser(sessionUser);
    }
    refreshUnread();
    mockDataService.syncWithBackend();
    setLoading(false);
  }, []);

  const login = async (mobileOrEmail, password) => {
    const result = await authService.login(mobileOrEmail, password);
    if (result.success) {
      setUser(result.user);
      mockDataService.syncWithBackend();
      refreshUnread();
    }
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    if (result.success) {
      setUser(result.user);
      refreshUnread();
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        unreadCount,
        refreshUnread
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
