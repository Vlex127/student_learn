import { NextResponse } from 'next/server';
import { removeAuthToken } from '@/lib/auth-utils';

export async function POST() {
  // Remove the auth token from cookies
  removeAuthToken();
  
  return NextResponse.json({ success: true });
}
