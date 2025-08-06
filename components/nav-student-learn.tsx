"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Book,
  BookOpen,
  BarChart,
  Bot,
  Home,
  PenTool,
  Trophy,
  Calendar,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { getCurrentUser } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/home",
    icon: Home,
  },
  {
    title: "My Courses",
    url: "/my-courses",
    icon: BookOpen,
  },
  {
    title: "Practice Tests",
    url: "/tests",
    icon: PenTool,
  },
  {
    title: "AI Tutor",
    url: "/ai",
    icon: Bot,
  },
  {
    title: "Study Library",
    url: "/library",
    icon: Book,
  },
  {
    title: "Progress",
    url: "/progress",
    icon: BarChart,
  },
  {
    title: "Achievements",
    url: "/achievements",
    icon: Trophy,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
];

const secondaryItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export function NavStudentLearn() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<number>(0);
  const pathname = usePathname();
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    // Only fetch if it's been at least 2 seconds since last check
    if (Date.now() - lastChecked < 2000) return;

    setLastChecked(Date.now());

    try {
      setIsLoading(true);
      const userData = await getCurrentUser();

      if (userData) {
        setUser({
          id: userData.id,
          name: userData.name || "User",
          email: userData.email || "",
          avatar: "/face.svg",
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [lastChecked, toast]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Set up polling to check for auth state changes
  useEffect(() => {
    const interval = setInterval(fetchUser, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [fetchUser]);

  // Fetch user data when pathname changes
  useEffect(() => {
    fetchUser();
  }, [pathname, fetchUser]);

  // Handle window focus event to refresh user data
  useEffect(() => {
    const handleFocus = () => {
      fetchUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUser]);

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <Image
                alt={user.name}
                className="object-cover"
                height={40}
                src={user.avatar || "/face.svg"}
                width={40}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;

                  target.src = "/face.svg";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <Link
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              href="/auth"
            >
              <User className="w-4 h-4 mr-2" />
              Sign in
            </Link>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    className="flex items-center space-x-2"
                    href={item.url}
                    onClick={() => fetchUser()} // Refresh user data when navigating
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarMenu>
            {secondaryItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    className="flex items-center space-x-2"
                    href={item.url}
                    onClick={() => fetchUser()} // Refresh user data when navigating
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>
    </>
  );
}
