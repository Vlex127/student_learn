"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
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
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive",
        duration: 5000,
      });

      return;
    }
    setIsLoading(true);
    try {
      if (isRegistering) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();

          throw new Error(error.error || "Registration failed");
        }
        toast({
          title: "Registration successful!",
          description: "You have been logged in.",
          duration: 3000,
        });
      }
      // Use NextAuth signIn for login
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: result.error,
          variant: "destructive",
          duration: 5000,
        });
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: error.message || "An error occurred during authentication",
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          required
          autoComplete="email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          required
          autoComplete="current-password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {isRegistering && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            required
            autoComplete="name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}
      <Button className="w-full" disabled={isLoading} type="submit">
        {isLoading ? "Loading..." : isRegistering ? "Register" : "Sign In"}
      </Button>
      <div className="text-center text-sm mt-2">
        {isRegistering ? (
          <>
            Already have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              type="button"
              onClick={() => setIsRegistering(false)}
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              type="button"
              onClick={() => setIsRegistering(true)}
            >
              Register
            </button>
          </>
        )}
      </div>
    </form>
  );
}
