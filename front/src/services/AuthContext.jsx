import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { saveToken, clearToken } from '../store/tokenSlice';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth-token') || '');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const setUserCookies = (userData) => {
    document.cookie = `auth_token=${encodeURIComponent(userData.token)}; path=/; SameSite=None; Secure`;
    document.cookie = `user_id=${encodeURIComponent(userData.userId)}; path=/; SameSite=None; Secure`;
    document.cookie = `user_name=${encodeURIComponent(userData.userName || '')}; path=/; SameSite=None; Secure`;
    document.cookie = `email=${encodeURIComponent(userData.email || '')}; path=/; SameSite=None; Secure`;
    document.cookie = `user_number=${encodeURIComponent(userData.userNumber || '')}; path=/; SameSite=None; Secure`;
    document.cookie = `registration_date=${encodeURIComponent(userData.registrationDate || '')}; path=/; SameSite=None; Secure`;
    document.cookie = `dlp_verified=${encodeURIComponent(userData.dlp_verified)}; path=/; SameSite=None; Secure`;
    document.cookie = `user_roles=${encodeURIComponent(JSON.stringify(userData.userRoles || []))}; path=/; SameSite=None; Secure`;
  };

  const clearUserCookies = () => {
    const cookies = ['auth_token', 'user_id', 'user_name', 'email', 'user_number', 'registration_date', 'dlp_verified', 'user_roles'];
    cookies.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
    });
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8082/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const userData = {
          userId: data.userId,
          userName: data.userName,
          email: data.email,
          userNumber: data.userNumber,
          registrationDate: data.registrationDate,
          dlp_verified: data.dlpverified, // Исправлено: DLPVerified → dlpverified
          userRoles: data.userRoles,
        };
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        dispatch(saveToken(data.token));
        setUserCookies({ ...userData, token: data.token });

        try {
          await fetch('http://localhost:8000/callback', { method: 'GET', credentials: 'include' });
        } catch (err) {
          console.warn('Локальное приложение не запущено: callback не удался');
        }

        navigate('/confidential-data');
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await fetch('http://localhost:8082/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();

      if (response.ok) {
        const userData = {
          userId: data.userId,
          userName: data.userName,
          email: data.email,
          userNumber: data.userNumber,
          registrationDate: data.registrationDate,
          dlp_verified: data.dlpverified, // Исправлено: DLPVerified → dlpverified
          userRoles: data.userRoles,
        };
        setUser(userData);
        setToken(data.token);
        localStorage.setItem('auth-token', data.token);
        dispatch(saveToken(data.token));
        setUserCookies({ ...userData, token: data.token });

        try {
          await fetch('http://localhost:8000/callback', { method: 'GET', credentials: 'include' });
        } catch (err) {
          console.warn('Локальное приложение не запущено: callback не удался');
        }

        navigate('/confidential-data');
      }
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:8082/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'auth-token': token },
      });
    } catch (error) {
      console.warn('Logout API error (игнорируется):', error);
    } finally {
      setUser(null);
      setToken('');
      localStorage.removeItem('auth-token');
      dispatch(clearToken());
      clearUserCookies();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}