"use client";

import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[sidebar=menu-action]/menu-item:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <span className="text-lg">StudentLearn</span>
        </Link>
      </div>
    </header>
  );
}
