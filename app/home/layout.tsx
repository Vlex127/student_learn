"use client";
import "../../styles/globals.css";
import React, { useState } from "react";
import { Book, BarChart, Bot, Home, PenTool, Menu } from "lucide-react";
import Link from "next/link";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-white dark:bg-zinc-900 p-4 border-b">
        <h1 className="text-xl font-bold">StudentLearn</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-zinc-800">
          <Menu size={24} />
        </button>
      </div>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-zinc-900 p-6 border-r flex flex-col z-40 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ minHeight: "100vh" }}
      >
        <h1 className="text-2xl font-bold mb-8 hidden md:block">StudentLearn</h1>
        <nav className="flex flex-col gap-4">
          <Link href="/home" className="flex items-center gap-2 font-medium hover:text-indigo-600 transition"><Home size={18}/> Dashboard</Link>
          <Link href="/tests" className="flex items-center gap-2 font-medium hover:text-indigo-600 transition"><PenTool size={18}/> Take Test</Link>
          <Link href="/ai" className="flex items-center gap-2 font-medium hover:text-indigo-600 transition"><Bot size={18}/> AI Tutor</Link>
          <Link href="/library" className="flex items-center gap-2 font-medium hover:text-indigo-600 transition"><Book size={18}/> Library</Link>
          <Link href="/progress" className="flex items-center gap-2 font-medium hover:text-indigo-600 transition"><BarChart size={18}/> Progress</Link>
        </nav>
        <div className="mt-auto text-xs text-muted-foreground pt-8 hidden md:block">© 2025 StudentLearn</div>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 relative md:ml-0 mt-16 md:mt-0">{children}</main>
    </div>
  );
}
