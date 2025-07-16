// app/auth/layout.tsx
import { GalleryVerticalEnd } from "lucide-react";
import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left: Branding + Content */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link className="flex items-center gap-2 font-medium" href="/">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            StudentLearn
          </Link>
        </div>

        {/* Page Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>

      {/* Right: Background */}
      <div className="relative hidden lg:block bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <GalleryVerticalEnd className="mx-auto h-24 w-24 mb-4 opacity-20" />
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to StudentLearn
            </h2>
            <p className="text-sm">
              Your journey to academic excellence starts here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
