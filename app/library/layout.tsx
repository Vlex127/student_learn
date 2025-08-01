<<<<<<< HEAD
"use client";
import React from "react";

import { AppHeader } from "@/components/app-header";
import { NavStudentLearn } from "@/components/nav-student-learn";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <span className="text-lg font-bold">S</span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">StudentLearn</span>
              <span className="truncate text-xs text-muted-foreground">Learning Platform</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <NavStudentLearn />
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 py-2 text-xs text-muted-foreground">
            © 2025 StudentLearn
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
=======
import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/home" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen size={24} className="text-indigo-600" />
              <h1 className="text-2xl font-bold">Library</h1>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
>>>>>>> 784d4a7d535a6b760ca9427be5794216fcecb6ef
  );
}
