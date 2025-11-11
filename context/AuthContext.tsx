import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.ts';
import { mockSignIn, mockSignOut, getMockCurrentUser } from '../services/mockApiService.ts';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getMockCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("No user session found");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const loggedInUser = await mockSignIn(email, pass);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login failed:", error);
      setUser(null);
      throw error; // Re-throw the error so UI components can catch it
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await mockSignOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
