"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const toggleMode = () => setIsRegistering(!isRegistering);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        // Registration logic (optional, not requested)
        const res = await fetch("http://localhost:8000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: name }),
        });
        if (!res.ok) throw new Error("Registration failed");
        // Optionally auto-login after registration
      } else {
        // Login logic
        const res = await fetch("http://localhost:8000/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        const token = data.access_token;
        window.localStorage.setItem("token", token);
        // Fetch user info
        const meRes = await fetch("http://localhost:8000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error("Failed to fetch user info");
        const user = await meRes.json();
        if (user.is_admin) {
          router.push("/admin");
        } else {
        router.push("/home");
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoComplete="name"
                className="pl-9"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="email"
              className="pl-9"
              id="email"
              placeholder="m@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              autoComplete="current-password"
              className="pl-9"
              id="password"
              placeholder="********"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
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
