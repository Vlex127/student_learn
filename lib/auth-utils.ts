// Utility functions for NextAuth integration
// These functions are kept for backward compatibility but now work with NextAuth

import { getSession } from 'next-auth/react';

// Get current user data using NextAuth session
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

// Check if user is authenticated using NextAuth
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// Legacy functions - kept for backward compatibility
// These now use NextAuth internally

export function setAuthToken(token: string) {
  // This function is deprecated - NextAuth handles token management
  console.warn('setAuthToken is deprecated. Use NextAuth signIn instead.');
}

export function removeAuthToken() {
  // This function is deprecated - NextAuth handles token management
  console.warn('removeAuthToken is deprecated. Use NextAuth signOut instead.');
}

export function getAuthToken(): string | undefined {
  // This function is deprecated - NextAuth handles token management
  console.warn('getAuthToken is deprecated. Use NextAuth useSession instead.');
  return undefined;
}
