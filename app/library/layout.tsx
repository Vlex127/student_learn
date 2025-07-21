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
  );
}
