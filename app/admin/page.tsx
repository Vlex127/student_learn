"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AdminUser {
  email: string;
  full_name: string;
  is_admin: boolean;
}

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.replace("/auth");

      return;
    }
    fetch("http://localhost:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");

        return res.json();
      })
      .then((data) => {
        if (!data.is_admin) {
          router.replace("/home");
        } else {
          setUser(data);
        }
      })
      .catch(() => router.replace("/auth"))
      .finally(() => setChecking(false));
  }, [router, token]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:8000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        // Fetched users: {data}
        setUsers(Array.isArray(data) ? data : []);
      });
  }, [token]);

  if (checking || !user) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* Pass real user data to your DataTable */}
              <DataTable data={users} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
