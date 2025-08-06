# JWT and NextAuth Fixes

This document outlines the fixes implemented to resolve JWT and NextAuth errors in the application.

## Issues Fixed

### 1. **Mixed Authentication Systems**
- **Problem**: The application had both NextAuth.js and a custom JWT-based authentication system running in parallel, causing conflicts.
- **Solution**: Removed the custom authentication system and standardized on NextAuth.js.

### 2. **NextAuth Configuration Issues**
- **Problem**: Type mismatches and improper error handling in the NextAuth configuration.
- **Solution**: 
  - Fixed type definitions in `types/next-auth.d.ts`
  - Improved error handling in the authorize callback
  - Added proper session and JWT maxAge settings
  - Added debug mode for development

### 3. **Middleware Conflicts**
- **Problem**: Middleware was using custom `auth_token` cookies instead of NextAuth session management.
- **Solution**: 
  - Updated middleware to use `getToken` from `next-auth/jwt`
  - Removed custom token verification logic
  - Added proper admin route protection

### 4. **Provider Integration Issues**
- **Problem**: SessionProvider was not properly integrated with the app layout.
- **Solution**: 
  - Wrapped the app with SessionProvider in `app/layout.tsx`
  - Ensured proper provider hierarchy

### 5. **Custom Auth API Routes**
- **Problem**: Custom auth API routes were conflicting with NextAuth endpoints.
- **Solution**: 
  - Removed conflicting custom auth routes (`/api/auth/login`, `/api/auth/logout`, etc.)
  - NextAuth now handles all authentication through its built-in endpoints

### 6. **Hook Conflicts**
- **Problem**: `useAuth` hook was using custom authentication instead of NextAuth.
- **Solution**: 
  - Updated `useAuth` hook to use NextAuth's `useSession`
  - Updated `useLogin` and `useLogout` to use NextAuth's `signIn` and `signOut`

### 7. **Type Definition Issues**
- **Problem**: Inconsistent type definitions causing TypeScript errors.
- **Solution**: 
  - Updated `types/next-auth.d.ts` with proper optional types
  - Ensured consistency between Session, User, and JWT interfaces

## Files Modified

### Core Authentication Files
- `app/api/auth/[...nextauth]/route.ts` - Fixed NextAuth configuration
- `app/layout.tsx` - Added SessionProvider
- `middleware.ts` - Updated to use NextAuth
- `types/next-auth.d.ts` - Fixed type definitions

### Hooks and Utilities
- `hooks/useAuth.ts` - Updated to use NextAuth
- `lib/auth-utils.ts` - Simplified to work with NextAuth

### Components
- `components/auth/sign-out-button.tsx` - Updated for NextAuth
- `components/auth/sign-in-form.tsx` - New component for NextAuth
- `components/ui/alert.tsx` - New UI component

### Removed Files
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/verify/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/session/route.ts`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Backend API Configuration
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Other Configuration
NODE_ENV=development
```

## Usage

### Authentication Hooks

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
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

### Sign In Form

```tsx
import { SignInForm } from '@/components/auth/sign-in-form';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm callbackUrl="/dashboard" />
    </div>
  );
}
```

### Sign Out Button

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

### Server-Side Authentication

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

## Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Set up environment variables** in `.env.local`

3. **Test authentication flow**:
   - Navigate to `/auth`
   - Sign in with valid credentials
   - Verify redirection to protected routes
   - Test sign out functionality

## Benefits of the Fixes

1. **Consistent Authentication**: Single authentication system using NextAuth.js
2. **Better Security**: Proper JWT handling and session management
3. **Type Safety**: Improved TypeScript support with proper type definitions
4. **Maintainability**: Cleaner codebase with fewer conflicts
5. **Developer Experience**: Better error handling and debugging capabilities

## Troubleshooting

- **Session not persisting**: Ensure `NEXTAUTH_SECRET` is set and consistent
- **CORS issues**: Make sure your backend allows requests from your frontend domain
- **Type errors**: Ensure all NextAuth types are properly imported and used
- **Middleware issues**: Check that the middleware matcher excludes API routes properly