"use client";

import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/auth",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Button className={className} variant="outline" onClick={handleSignOut}>
      {children || "Sign Out"}
    </Button>
  );
}
