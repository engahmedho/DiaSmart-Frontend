import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'admin';
  is_active: boolean;
  age?: number;
  gender?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token, role, user_id } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user_id.toString());
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user details
      const userResponse = await axios.get('/auth/me');
      setUser(userResponse.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      await axios.post('/auth/signup', userData);
      // Auto-login after signup
      await login(userData.email, userData.password);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put('/auth/me', data);
      setUser(response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Update failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
