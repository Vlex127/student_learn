# Authentication System

This application uses NextAuth.js for authentication, integrated with a custom FastAPI backend that uses JWT for session management.

## Features

- Email/Password authentication
- JWT-based sessions
- Protected routes with middleware
- Role-based access control (admin vs regular users)
- Automatic token refresh

## Setup

1. **Environment Variables**

   Create a `.env.local` file in the root of your project with the following variables:

   ```
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   ```

   The `NEXTAUTH_SECRET` should be a random string used to encrypt the NextAuth.js JWT. You can generate one using:
   ```bash
   openssl rand -base64 32
   ```

2. **Backend Configuration**

   Ensure your FastAPI backend is running and accessible at `http://localhost:8000` with the following endpoints:
   - `POST /auth/register` - User registration
   - `POST /auth/login` - User login (returns JWT)
   - `GET /auth/me` - Get current user info

## Usage

### Authentication Hooks

1. **useUserSession**

   Use this hook to get the current user session in any client component:

   ```tsx
   'use client';
   
   import { useUserSession } from '@/hooks/use-session';
   
   export default function Profile() {
     const { user, isAuthenticated, isLoading } = useUserSession();
     
     if (isLoading) return <div>Loading...</div>;
     if (!isAuthenticated) return <div>Please sign in</div>;
     
     return (
       <div>
         <h1>Welcome, {user?.name}!</h1>
         <p>Email: {user?.email}</p>
         {user?.isAdmin && <p>You are an administrator</p>}
       </div>
     );
   }
   ```

2. **Server-Side Authentication**

   For server components, you can use the `getServerSession` function:

   ```tsx
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/api/auth/[...nextauth]/route';
   
   export default async function ServerComponent() {
     const session = await getServerSession(authOptions);
     
     if (!session) {
       return <div>Please sign in</div>;
     }
     
     return (
       <div>
         <h1>Welcome, {session.user.name}!</h1>
       </div>
     );
   }
   ```

### Protecting Routes

1. **Client-Side Protection**

   Use the `useUserSession` hook to protect client components:

   ```tsx
   'use client';
   
   import { useUserSession } from '@/hooks/use-session';
   import { useRouter } from 'next/navigation';
   
   export default function ProtectedPage() {
     const { isAuthenticated, isLoading } = useUserSession();
     const router = useRouter();
     
     if (isLoading) return <div>Loading...</div>;
     if (!isAuthenticated) {
       router.push('/auth');
       return null;
     }
     
     return <div>Protected content</div>;
   }
   ```

2. **Server-Side Protection**

   For API routes or server components, use the `getServerSession` function:

   ```ts
   import { getServerSession } from 'next-auth';
   import { authOptions } from '@/app/api/auth/[...nextauth]/route';
   import { NextResponse } from 'next/server';
   
   export async function GET() {
     const session = await getServerSession(authOptions);
     
     if (!session) {
       return NextResponse.json(
         { error: 'Unauthorized' },
         { status: 401 }
       );
     }
     
     return NextResponse.json({ message: 'Protected data' });
   }
   ```

### Admin Routes

Admin routes are protected by the middleware. Only users with `isAdmin: true` can access routes under `/admin`.

## Components

### Sign Out Button

Use the `SignOutButton` component to allow users to sign out:

```tsx
import { SignOutButton } from '@/components/auth/sign-out-button';

export default function Navbar() {
  return (
    <nav>
      {/* Other nav items */}
      <SignOutButton />
    </nav>
  );
}
```

## Testing

1. **Test User Registration**
   - Navigate to `/auth`
   - Click "Sign Up"
   - Fill in the registration form
   - You should be automatically logged in and redirected to the home page

2. **Test User Login**
   - Navigate to `/auth`
   - Enter your credentials
   - You should be logged in and redirected to the home page

3. **Test Protected Routes**
   - Try accessing a protected route while logged out
   - You should be redirected to the login page
   - After logging in, you should be redirected back to the protected route

4. **Test Admin Routes**
   - Log in as a non-admin user
   - Try accessing `/admin`
   - You should be redirected to the home page
   - Log in as an admin user
   - You should be able to access the admin section

## Troubleshooting

- **Session not persisting**: Ensure your `NEXTAUTH_SECRET` is set and consistent across deployments
- **CORS issues**: Make sure your backend allows requests from your frontend domain
- **Token expiration**: The JWT token expires after 30 minutes by default. The session will be automatically refreshed when making authenticated requests
