import Cookies from 'js-cookie';

// Set auth token in cookies
export function setAuthToken(token: string) {
  const cookieOptions = {
    expires: 7, // 1 week
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const, // Changed from 'strict' to 'lax' for better compatibility
    path: '/',
    httpOnly: false // Must be false to be accessible via client-side JavaScript
  };

  // Set cookie on client side
  if (typeof window !== 'undefined') {
    Cookies.set('auth_token', token, cookieOptions);
  }
  
  // Return the cookie string that can be used to set the cookie in server responses
  return `auth_token=${token}; ${Object.entries({
    ...cookieOptions,
    expires: new Date(Date.now() + cookieOptions.expires * 24 * 60 * 60 * 1000).toUTCString(),
    httpOnly: true, // Can be true here since this is for server response
    secure: cookieOptions.secure ? 'Secure' : undefined,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path
  })
  .filter(([_, v]) => v !== undefined && v !== '')
  .map(([k, v]) => `${k}=${v}`)
  .join('; ')}`;
}

// Remove auth token from cookies
export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    Cookies.remove('auth_token', { path: '/' });
  }
  return 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';
}

// Get auth token from cookies
export function getAuthToken(): string | undefined {
  if (typeof window !== 'undefined') {
    return Cookies.get('auth_token');
  }
  return undefined;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch('/api/auth/verify');
    if (response.ok) {
      const data = await response.json();
      return data.verified === true;
    }
    return false;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

// Get current user data
export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}
