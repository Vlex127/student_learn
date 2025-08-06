import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated } from '@/lib/auth-utils';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [authStatus, userData] = await Promise.all([
          isAuthenticated(),
          getCurrentUser()
        ]);
        
        setIsAuth(authStatus);
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated: isAuth,
    loading,
  };
}

export function useLogin() {
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Force a full page reload to ensure all auth state is properly updated
      window.location.href = '/home';
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return login;
}

export function useLogout() {
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return logout;
}
