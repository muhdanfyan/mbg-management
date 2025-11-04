import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types
export type UserRole = 'Super Admin' | 'Manager' | 'Finance' | 'HRD' | 'Procurement' | 'Staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  position: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Mock user data
const mockUsers: Profile[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'superadmin@mbg.com',
    full_name: 'Super Admin',
    role: 'Super Admin',
    department: 'IT',
    position: 'Administrator',
    phone: '081234567890',
    avatar_url: 'https://i.pravatar.cc/150?u=superadmin@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    email: 'manager@mbg.com',
    full_name: 'Manager',
    role: 'Manager',
    department: 'Management',
    position: 'Manager',
    phone: '081234567891',
    avatar_url: 'https://i.pravatar.cc/150?u=manager@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef2',
    email: 'finance@mbg.com',
    full_name: 'Finance',
    role: 'Finance',
    department: 'Finance',
    position: 'Finance Staff',
    phone: '081234567892',
    avatar_url: 'https://i.pravatar.cc/150?u=finance@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef3',
    email: 'hrd@mbg.com',
    full_name: 'HRD',
    role: 'HRD',
    department: 'Human Resources',
    position: 'HR Staff',
    phone: '081234567893',
    avatar_url: 'https://i.pravatar.cc/150?u=hrd@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef4',
    email: 'procurement@mbg.com',
    full_name: 'Procurement',
    role: 'Procurement',
    department: 'Procurement',
    position: 'Procurement Staff',
    phone: '081234567894',
    avatar_url: 'https://i.pravatar.cc/150?u=procurement@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f6a7b8c9-d0e1-2345-6789-0abcdef5',
    email: 'staff@mbg.com',
    full_name: 'Staff',
    role: 'Staff',
    department: 'General',
    position: 'Staff',
    phone: '081234567895',
    avatar_url: 'https://i.pravatar.cc/150?u=staff@mbg.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface AuthContextType {
  user: any | null; // Using any for mock user
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
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const loading = false; // No loading state needed for mock auth

  const signIn = async (email: string, password: string) => {
    const foundUser = mockUsers.find(u => u.email === email);

    if (foundUser && password === 'pass123') {
      setUser(foundUser);
      setProfile(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
