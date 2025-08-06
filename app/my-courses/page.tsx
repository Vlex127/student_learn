"use client";
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Grid,
  List,
  Play,
  CheckCircle,
  X,
  AlertCircle,
  Calendar,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getMyEnrolledCourses,
  unenrollFromCourse,
  Course,
  transformCourseForUI,
} from "@/lib/api";

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "in-progress" | "completed"
  >("all");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [unenrollLoading, setUnenrollLoading] = useState<
    Record<number, boolean>
  >({});
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("focus", checkAuth);

    return () => window.removeEventListener("focus", checkAuth);
  }, []);

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!isAuthenticated) {
        setLoading(false);

        return;
      }

      setLoading(true);
      try {
        const result = await getMyEnrolledCourses();

        if (result.data) {
          const transformedCourses = result.data.map((course) => ({
            ...transformCourseForUI(course),
            progress: Math.floor(Math.random() * 100), // Mock progress
            status: Math.random() > 0.7 ? "completed" : "in-progress", // Mock status
            lastAccessed: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString(),
          }));

          setCourses(transformedCourses);
          setError(null);
        } else if (result.error) {
          setError(result.error);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        setError("Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [isAuthenticated]);

  const handleUnenroll = async (courseId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to unenroll from "${courseName}"?`)) {
      return;
    }

    setUnenrollLoading((prev) => ({ ...prev, [courseId]: true }));

    try {
      const result = await unenrollFromCourse(courseId);

      if (result.error) {
        showMessage("error", result.error);
      } else {
        showMessage("success", `Successfully unenrolled from ${courseName}`);
        setCourses((prev) => prev.filter((course) => course.id !== courseId));
      }
    } catch (error) {
      console.error("Unenroll error:", error);
      showMessage("error", "Failed to unenroll from course");
    } finally {
      setUnenrollLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  // Filter courses based on search and status
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || (course as any).status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto text-orange-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your enrolled courses.
          </p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
            onClick={() => (window.location.href = "/auth")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={32} />
            My Courses
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your enrolled courses
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award size={16} />
          <span>{courses.length} courses enrolled</span>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : message.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button
              className="text-current hover:opacity-70"
              onClick={() => setMessage(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search your courses..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" size={16} />
            <select
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">All Courses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`p-2 ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </button>
            <button
              className={`p-2 ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        filteredCourses.length === 0 &&
        courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold mb-2">No Courses Enrolled</h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t enrolled in any courses yet. Browse the library
              to find courses to add.
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
              onClick={() => (window.location.href = "/library")}
            >
              Browse Courses
            </button>
          </div>
        )}

      {/* No Search Results */}
      {!loading &&
        !error &&
        filteredCourses.length === 0 &&
        courses.length > 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
            <p className="text-muted-foreground">
              No courses match your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}

      {/* Courses Grid/List */}
      {!loading && !error && filteredCourses.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredCourses.map((course) => {
            const isUnenrolling = unenrollLoading[course.id] || false;
            const progress = (course as any).progress || 0;
            const status = (course as any).status || "in-progress";
            const lastAccessed = (course as any).lastAccessed || "Never";

            if (viewMode === "list") {
              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${course.color || "bg-indigo-500"}`}
                      >
                        <BookOpen className="text-white" size={24} />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {course.title || course.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>{progress}% complete</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Last accessed: {lastAccessed}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {status === "completed" ? (
                              <CheckCircle
                                className="text-green-500"
                                size={14}
                              />
                            ) : (
                              <Play className="text-blue-500" size={14} />
                            )}
                            <span className="capitalize">
                              {status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition text-sm"
                        onClick={() => router.push(`/courses/${course.id}`)}
                      >
                        Continue
                      </button>
                      <button
                        className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition text-sm disabled:opacity-50"
                        disabled={isUnenrolling}
                        onClick={() => handleUnenroll(course.id, course.name)}
                      >
                        {isUnenrolling ? "..." : "Unenroll"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${course.color || "bg-indigo-500"}`}
                  >
                    <BookOpen className="text-white" size={24} />
                  </div>

                  <div className="flex items-center gap-1">
                    {status === "completed" ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <Play className="text-blue-500" size={16} />
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {course.title || course.name}
                </h3>

                {course.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{course.students || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration || "Self-paced"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition text-sm font-medium"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    Continue Learning
                  </button>
                  <button
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition text-sm disabled:opacity-50"
                    disabled={isUnenrolling}
                    title="Unenroll from course"
                    onClick={() => handleUnenroll(course.id, course.name)}
                  >
                    {isUnenrolling ? "..." : <X size={16} />}
                  </button>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Last accessed: {lastAccessed}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
