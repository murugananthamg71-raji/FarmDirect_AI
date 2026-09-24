import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('farmdirect_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('farmdirect_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('farmdirect_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('farmdirect_token', newToken);
    localStorage.setItem('farmdirect_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('farmdirect_token');
    localStorage.removeItem('farmdirect_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('farmdirect_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
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

