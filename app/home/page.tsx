"use client";
import { useState, useRef, useEffect } from "react";
import {
  Bot,
  BookOpen,
  PenTool,
  BarChart3,
  Trophy,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Calendar,
  Star,
  Play,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  // For draggable chat icon
  const [chatPos, setChatPos] = useState({ x: 20, y: 80 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showChat, setShowChat] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Mock user data (replace with real data from API)
  // const userStats = {
  //   testsCompleted: 24,
  //   averageScore: 87,
  //   studyStreak: 7,
  //   totalStudyTime: 45,
  // };

  const recentActivity = [
    { subject: "Mathematics", score: 92, date: "Today" },
    { subject: "Physics", score: 85, date: "Yesterday" },
    { subject: "Chemistry", score: 78, date: "2 days ago" },
  ];

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setHasDragged(false);
    const rect = chatRef.current?.getBoundingClientRect();

    if (rect) {
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // Global mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setHasDragged(true);
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;

        setChatPos({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
    };

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset]);

  // Touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setHasDragged(false);
    const touch = e.touches[0];
    const rect = chatRef.current?.getBoundingClientRect();

    if (rect) {
      setOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
  };

  // Global touch move handler
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (dragging && e.touches.length > 0) {
        e.preventDefault();
        setHasDragged(true);
        const touch = e.touches[0];
        const newX = touch.clientX - offset.x;
        const newY = touch.clientY - offset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 60;

        setChatPos({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    };

    const handleTouchEnd = () => {
      setDragging(false);
    };

    if (dragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, offset]);

  // Handle click (only if not dragged)
  const handleClick = () => {
    if (!hasDragged) {
      setShowChat(true);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Display user info if logged in */}
      {status === "authenticated" && session?.user ? (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="text-lg font-semibold">Welcome, {session.user.name || session.user.email}!</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Email: {session.user.email}</div>
        </div>
      ) : status === "loading" ? (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">Loading user info...</div>
      ) : (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">Not logged in</div>
      )}
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Trophy className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* {userStats.testsCompleted} */}
            {/* Mock data removed */}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tests Completed
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* {userStats.averageScore}% */}
            {/* Mock data removed */}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Average Score
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* {userStats.studyStreak} */}
            {/* Mock data removed */}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Day Streak
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* {userStats.totalStudyTime}h */}
            {/* Mock data removed */}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Study Time
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.score >= 90
                        ? "bg-green-500"
                        : activity.score >= 75
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.subject}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {activity.score}%
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Tasks
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Physics Quiz
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due in 2 days
                </p>
              </div>
              <Star className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Math Assignment
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due in 5 days
                </p>
              </div>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Chemistry Lab
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Due in 1 week
                </p>
              </div>
              <Award className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link className="group" href="/tests">
            <div className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Start Practice
              </span>
            </div>
          </Link>
          <Link className="group" href="/ai">
            <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <Bot className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Ask AI Tutor
              </span>
            </div>
          </Link>
          <Link className="group" href="/library">
            <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Study Library
              </span>
            </div>
          </Link>
          <Link className="group" href="/progress">
            <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                View Progress
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Draggable AI Chat Icon */}
      <div
        ref={chatRef}
        className={`bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center md:p-4 sm:p-3 ${dragging ? "scale-110" : "hover:scale-105"}`}
        role="button"
        style={{
          position: "fixed",
          left: chatPos.x,
          top: chatPos.y,
          zIndex: 50,
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "all 0.2s ease",
          touchAction: "none",
          userSelect: "none",
        }}
        tabIndex={0}
        title="Chat with AI Tutor"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        <Bot size={24} />
      </div>

      {/* Chat Modal (simple placeholder) */}
      {showChat && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-end z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl w-full max-w-md p-4 md:p-6 m-2 md:m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Bot /> AI Tutor
              </h3>
              <button
                className="text-gray-400 hover:text-red-500 text-xl"
                onClick={() => setShowChat(false)}
              >
                &times;
              </button>
            </div>
            <div className="h-40 md:h-48 overflow-y-auto border rounded p-2 mb-4 bg-gray-50 dark:bg-zinc-800">
              <p className="text-muted-foreground">Chat UI coming soon...</p>
            </div>
            <input
              disabled
              className="w-full border rounded px-3 py-2"
              placeholder="Type your question..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
