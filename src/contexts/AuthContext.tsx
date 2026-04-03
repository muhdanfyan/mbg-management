import React, { createContext, useContext, useState, ReactNode } from 'react';

import { api, Profile, UserRole } from '../services/api';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('mbg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('mbg_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      setUser(data);
      setProfile(data);
      localStorage.setItem('mbg_user', JSON.stringify(data));
      localStorage.setItem('mbg_profile', JSON.stringify(data));
    } catch (err: any) {
      throw new Error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('mbg_user');
    localStorage.removeItem('mbg_profile');
  };

  const hasRole = (roles: UserRole[] | UserRole): boolean => {
    if (!profile) return false;
    if (Array.isArray(roles)) {
      return roles.includes(profile.role);
    }
    return profile.role === roles;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
