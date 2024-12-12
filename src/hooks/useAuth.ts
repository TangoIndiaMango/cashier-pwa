import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RemoteApi } from '@/lib/api/remoteApi';
import { db } from '@/lib/db/schema';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setIsAuthenticated(true);
      } else if (token) {
        try {
          const user = await RemoteApi.getUserByToken(token);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Error authenticating with token:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token, navigate]);

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    db.close();
    await db.delete();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return { isAuthenticated, isLoading, logout };
}

