import React from "react";
import { Providers } from "./providers";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
