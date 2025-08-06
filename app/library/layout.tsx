
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

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              <span className="truncate text-xs text-muted-foreground">
                Learning Platform
              </span>
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
