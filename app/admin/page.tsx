"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Users, BookOpen, TrendingUp, Server } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { DataTable } from "@/components/data-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  adminGetUsers,
  adminGetStatistics,
  adminGetSystemHealth,
  adminGetSubjectAnalytics,
  adminGetPracticeAnalytics,
  adminGetQuestionStatistics,
  adminGetEnrollments,
} from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  created_at?: string;
}

const userColumns: ColumnDef<User>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "full_name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "is_admin",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_admin") ? "default" : "secondary"}>
        {row.getValue("is_admin") ? "Admin" : "User"}
      </Badge>
    ),
  },
];

export default function AdminPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [subjectAnalytics, setSubjectAnalytics] = useState<any[]>([]);
  const [practiceAnalytics, setPracticeAnalytics] = useState<any>(null);
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [
          usersRes,
          statsRes,
          healthRes,
          subjRes,
          pracRes,
          quesRes,
          enrollRes,
        ] = await Promise.all([
          adminGetUsers(),
          adminGetStatistics(),
          adminGetSystemHealth(),
          adminGetSubjectAnalytics(),
          adminGetPracticeAnalytics(),
          adminGetQuestionStatistics(),
          adminGetEnrollments(),
        ]);

        if (usersRes.data) setUsers(usersRes.data);
        if (statsRes.data) setStats(statsRes.data);
        if (healthRes.data) setSystemHealth(healthRes.data);
        if (subjRes.data) setSubjectAnalytics(subjRes.data);
        if (pracRes.data) setPracticeAnalytics(pracRes.data);
        if (quesRes.data) setQuestionStats(quesRes.data);
        if (enrollRes.data) setEnrollments(enrollRes.data);
        setError(null);
      } catch (e) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        Loading admin dashboard...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-600">
        {error}
      </div>
    );
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
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Server size={28} /> Admin Dashboard
          </h1>
          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="users"><Users size={16} /> Users</TabsTrigger>
              <TabsTrigger value="subjects"><BookOpen size={16} /> Subjects</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="analytics"><TrendingUp size={16} /> Analytics</TabsTrigger>
              <TabsTrigger value="system"><Server size={16} /> System</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "users" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Users</h2>
              <DataTable columns={userColumns} data={users} />
            </div>
          )}
          {tab === "subjects" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Subjects Analytics</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-zinc-800">
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2 text-left">Enrollments</th>
                      <th className="p-2 text-left">Questions</th>
                      <th className="p-2 text-left">Avg. Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectAnalytics.map((s, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{s.subject?.name}</td>
                        <td className="p-2">{s.enrollment_count}</td>
                        <td className="p-2">{s.question_count}</td>
                        <td className="p-2">{s.average_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === "questions" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Question Statistics
              </h2>
              {questionStats && (
                <div className="space-y-2">
                  <div>Total Questions: {questionStats.total_questions}</div>
                  <div>Active Questions: {questionStats.active_questions}</div>
                  <div>
                    By Difficulty: Easy {questionStats.by_difficulty?.easy},
                    Medium {questionStats.by_difficulty?.medium}, Hard{" "}
                    {questionStats.by_difficulty?.hard}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "analytics" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Practice Analytics</h2>
              {practiceAnalytics && (
                <div className="space-y-2">
                  <div>
                    Total Sessions: {practiceAnalytics.overall?.total_sessions}
                  </div>
                  <div>
                    Average Score: {practiceAnalytics.overall?.average_score}
                  </div>
                  <div>
                    Top Users:{" "}
                    {practiceAnalytics.top_users
                      ?.map((u: any) => u.name)
                      .join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === "system" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">System Health</h2>
              {systemHealth && (
                <div className="space-y-2">
                  <div>Status: {systemHealth.status}</div>
                  <div>Database: {systemHealth.database}</div>
                  <div>Total Users: {systemHealth.statistics?.total_users}</div>
                  <div>
                    Inactive Subjects:{" "}
                    {systemHealth.statistics?.inactive_subjects}
                  </div>
                  <div>
                    Inactive Questions:{" "}
                    {systemHealth.statistics?.inactive_questions}
                  </div>
                  <div>
                    New Users (24h):{" "}
                    {systemHealth.recent_activity?.new_users_24h}
                  </div>
                  <div>
                    Sessions (24h): {systemHealth.recent_activity?.sessions_24h}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
