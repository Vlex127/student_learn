'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@heroui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth' });
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleSignOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
