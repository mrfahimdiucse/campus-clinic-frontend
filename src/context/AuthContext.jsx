import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';

const AuthContext = createContext();

const normalizeUser = (value) => {
  const user = value?.user || value;
  if (!user) return null;

  return {
    ...user,
    role: String(user.role || '').toLowerCase(),
  };
};

const getAuthPayload = (response) => response.data?.data || response.data;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = getAuthPayload(response);
    const loggedUser = normalizeUser(payload);
    const token = payload.token || payload.accessToken;

    if (!loggedUser?.role || !token) {
      throw new Error('Invalid authentication response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const payload = getAuthPayload(response);
    const newUser = normalizeUser(payload);
    const token = payload.token || payload.accessToken;

    if (!newUser?.role || !token) {
      throw new Error('Invalid registration response');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
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