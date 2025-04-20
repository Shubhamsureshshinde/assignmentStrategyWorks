import { createContext, useState, useEffect } from 'react';
import api from '../Services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.setToken(token);
          const res = await api.get('/auth');
          setUser(res);
          setLoading(false);
        } catch (err) {
          console.error('Error loading user:', err);
          logout();
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      setError(null);
      const data = await api.post('/auth/login', { email, password });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      api.setToken(data.token);
      
      const userData = await api.get('/auth');
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);
      const data = await api.post('/auth/register', { name, email, password, role });
      setToken(data.token);
      localStorage.setItem('token', data.token);
      api.setToken(data.token);
      
      const userData = await api.get('/auth');
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};