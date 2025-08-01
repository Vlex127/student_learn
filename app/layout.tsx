"use client";
import React, { useState } from "react";
import { Book, BarChart, Bot, Home, PenTool, Menu } from "lucide-react";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
