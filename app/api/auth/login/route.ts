import { NextResponse } from 'next/server';
import { setAuthToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Call your backend login endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.detail || 'Login failed' },
        { status: response.status }
      );
    }

    const { access_token, user } = await response.json();
    
    // Get the cookie string from setAuthToken
    const cookieString = setAuthToken(access_token);
    
    // Create the response
    const apiResponse = NextResponse.json({ user });
    
    // Set the cookie in the response headers
    apiResponse.headers.set('Set-Cookie', cookieString);
    
    return apiResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
