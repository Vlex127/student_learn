"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface AdminUser {
  email: string;
  full_name: string;
  is_admin: boolean;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at?: string;
}

// Define columns for the user data table
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("full_name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "is_admin",
    header: "Role",
    cell: ({ row }) => {
      const isAdmin = row.getValue("is_admin") as boolean;
      return (
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin" : "User"}
        </Badge>
      );
    },
  },
];

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
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
      .catch((err) => {
        console.error("Auth error:", err);
        setError("Failed to authenticate. Please check if the backend server is running.");
        router.replace("/auth");
      })
      .finally(() => setChecking(false));
  }, [router, token]);

  useEffect(() => {
    if (!token) return;
    
    fetch("http://localhost:8000/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Users fetch error:", err);
        setError("Failed to load users. Please check if the backend server is running.");
        setUsers([]); // Set empty array to prevent DataTable errors
      });
  }, [token]);

  if (checking || !user) {
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure the backend server is running on port 8000
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

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
              {error && (
                <div className="px-4 lg:px-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}
              <div className="px-4 lg:px-6">
                <DataTable columns={userColumns} data={users} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
