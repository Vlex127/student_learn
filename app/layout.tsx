import React from "react";
import { SessionProvider } from "next-auth/react";

import { Providers } from "./providers";

import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body>
        <SessionProvider>
          <Providers>{children}</Providers>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
