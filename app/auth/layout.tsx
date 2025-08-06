// app/auth/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - StudentLearn",
  description: "Sign in to access your StudentLearn account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
