import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  loginWithPasscode: (passcode: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  switchPersona: (personaId: string) => Promise<void>;
  googleLogin: (payload?: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user as any);
      setProfile(data.profile as any);
    } catch (err) {
      console.warn('Offline session initialized', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password?: string }) => {
    setIsLoading(true);
    try {
      const data = await api.login(credentials);
      setUser(data.user as any);
      setProfile(data.profile as any);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPasscode = async (passcode: string) => {
    setIsLoading(true);
    try {
      const data = await api.loginWithPasscode(passcode);
      setUser(data.user as any);
      setProfile(data.profile as any);
    } finally {
      setIsLoading(false);
    }
  };

  const switchPersona = async (personaId: string) => {
    setIsLoading(true);
    try {
      const data = await api.switchPersona(personaId);
      setUser(data.user as any);
      setProfile(data.profile as any);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const data = await api.register(payload);
      setUser(data.user as any);
      setProfile(data.profile as any);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload?: any) => {
    return login({ email: payload?.email || 'demo.learner@skillpath.local' });
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data.profile as any);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const updateProfile = async (payload: Partial<UserProfile>) => {
    try {
      const data = await api.updateProfile(payload as any);
      setProfile(data.profile as any);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        loginWithPasscode,
        register,
        switchPersona,
        googleLogin,
        logout,
        refreshProfile,
        updateProfile,
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
