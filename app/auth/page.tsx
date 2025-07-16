"use client";

import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleMode = () => setIsRegistering(!isRegistering);

  return (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isRegistering ? "Create an account" : "Login to your account"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isRegistering
            ? "Sign up to start practicing for exams."
            : "Enter your details to access your dashboard."}
        </p>
      </div>

      <div className="grid gap-4">
        {isRegistering && (
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoComplete="name"
                className="pl-9"
                id="name"
                placeholder="John Doe"
              />
            </div>
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="email"
              className="pl-9"
              id="email"
              placeholder="m@example.com"
              type="email"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="current-password"
              className="pl-9"
              id="password"
              placeholder="********"
              type="password"
            />
          </div>
        </div>

        <Button className="w-full" type="submit">
          {isRegistering ? "Sign Up" : "Login"}
        </Button>

        <div className="text-center text-sm">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            className="text-primary underline underline-offset-4 hover:no-underline"
            type="button"
            onClick={toggleMode}
          >
            {isRegistering ? "Login" : "Sign Up"}
          </button>
        </div>
      </div>
    </form>
  );
}
