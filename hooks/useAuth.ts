import { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    loading: status === 'loading',
    session,
  };
}

export function useLogin() {
  const router = useRouter();
  
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        // Redirect to home page after successful login
        router.push('/home');
        return { success: true };
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return login;
}

export function useLogout() {
  const router = useRouter();
  
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return logout;
}
