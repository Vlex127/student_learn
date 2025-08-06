"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const login = useLogin();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (isRegistering && !name) {
      toast({
        title: "Validation Error",
        description: "Please enter your full name",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
          credentials: 'include', // Important for cookies to be set
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registration failed');
        }

        toast({
          title: "Registration successful!",
          description: "You have been logged in.",
          duration: 3000,
        });
      }

      await login(email, password);
      
      // Force a full page reload to ensure all auth state is updated
      window.location.href = callbackUrl;
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || 'An error occurred during authentication',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isRegistering ? 'Create your account' : 'Login to your account'}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {isRegistering 
            ? 'Enter your details to create an account' 
            : 'Enter your email below to login to your account'}
        </p>
      </div>
      
      <div className="grid gap-6">
        {isRegistering && (
          <div className="grid gap-3">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
        )}
        
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {!isRegistering && (
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Feature coming soon",
                    description: "Password reset functionality will be available soon.",
                  });
                }}
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isRegistering ? 'Creating account...' : 'Logging in...'}
            </>
          ) : isRegistering ? (
            'Create Account'
          ) : (
            'Login'
          )}
        </Button>
        
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        
        <Button variant="outline" type="button" className="w-full" disabled={isLoading}>
          <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          {isRegistering ? 'Sign up with GitHub' : 'Login with GitHub'}
        </Button>
        
        <div className="text-center text-sm">
          {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="underline underline-offset-4 hover:text-primary"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setEmail('');
              setPassword('');
              setName('');
            }}
            disabled={isLoading}
          >
            {isRegistering ? 'Login' : 'Sign up'}
          </button>
        </div>
      </div>
    </form>
  );
}
