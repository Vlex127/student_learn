import { NextResponse } from 'next/server';
import { setAuthToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    // Call your backend register endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'Registration failed' },
        { status: response.status }
      );
    }

    const { access_token, user } = await response.json();
    
    // Set the auth token in cookies
    setAuthToken(access_token);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
