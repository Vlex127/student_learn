"use client"

import {
  Book,
  BarChart,
  Bot,
  Home,
  PenTool,
  Trophy,
  Calendar,
  Settings,
  User,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/home",
    icon: Home,
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
]

const secondaryItems = [
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
]

export function NavStudentLearn() {
  return (
    <>
      {/* Main Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>Learning</SidebarGroupLabel>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Secondary Navigation */}
      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarMenu>
          {secondaryItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}
