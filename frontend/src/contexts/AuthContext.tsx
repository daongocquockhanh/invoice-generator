'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthTokens } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = localStorage.getItem('authTokens');
        if (tokens) {
          const parsedTokens: AuthTokens = JSON.parse(tokens);
          const userData = await authService.getCurrentUser(parsedTokens.accessToken);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authTokens');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { user: userData, tokens } = response;
      
      setUser(userData);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData);
      const { user: newUser, tokens } = response;
      
      setUser(newUser);
      localStorage.setItem('authTokens', JSON.stringify(tokens));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authTokens');
  };

  const refreshToken = async () => {
    try {
      const tokens = localStorage.getItem('authTokens');
      if (!tokens) {
        throw new Error('No tokens found');
      }

      const parsedTokens: AuthTokens = JSON.parse(tokens);
      const newTokens = await authService.refreshToken(parsedTokens.refreshToken);
      
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
