'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user session on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User session loaded:', userData);
        setUser(userData);
      } else if (response.status === 401) {
        // Not authenticated - this is normal
        console.log('ℹ️ No active session');
        setUser(null);
      } else {
        // Other error
        console.error('❌ Session fetch failed:', response.status);
        setUser(null);
        setError('Failed to load session');
      }
    } catch (err) {
      console.error('❌ Failed to fetch user:', err);
      setError('Failed to load user session');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    // Clear user state immediately for instant UI update
    setUser(null);
    setIsLoading(true);
    
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout');
      // Redirect to home
      window.location.href = '/';
    } catch (err) {
      console.error('Logout failed:', err);
      // Still redirect even if logout fails
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
