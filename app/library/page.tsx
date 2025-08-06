"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  FileText,
  BookOpen,
  Clock,
  Users,
  Search,
  Plus,
  Check,
  X,
} from "lucide-react";

import {
  getCourses,
  Course,
  transformCourseForUI,
  enrollInCourse,
  unenrollFromCourse,
  getMyEnrolledCourses,
} from "@/lib/api";

export default function LibraryPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    Record<number, boolean>
  >({});
  const [enrollmentLoading, setEnrollmentLoading] = useState<
    Record<number, boolean>
  >({});
  const [showMyCoursesOnly, setShowMyCoursesOnly] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const { user } = await response.json();

        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Calculate enrolled courses count dynamically from enrollment status
  const enrolledCoursesCount = useMemo(() => {
    return Object.values(enrollmentStatus).filter(Boolean).length;
  }, [enrollmentStatus]);

  // Get currently enrolled courses from all courses based on enrollment status
  const currentlyEnrolledCourses = useMemo(() => {
    return courses.filter((course) => enrollmentStatus[course.id]);
  }, [courses, enrollmentStatus]);

  // Fetch all courses and enrollment status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all available courses
        const coursesResult = await getCourses();

        if (coursesResult.data) {
          const transformedCourses =
            coursesResult.data.map(transformCourseForUI);

          setCourses(transformedCourses);
        } else if (coursesResult.error) {
          setError(coursesResult.error);

          return;
        }

        // Fetch user's enrolled courses
        const enrolledResult = await getMyEnrolledCourses();

        if (enrolledResult.data) {
          const transformedEnrolled =
            enrolledResult.data.map(transformCourseForUI);

          setMyCourses(transformedEnrolled);

          // Update enrollment status
          const statusMap: Record<number, boolean> = {};

          transformedEnrolled.forEach((course) => {
            statusMap[course.id] = true;
          });
          setEnrollmentStatus(statusMap);
        } else if (enrolledResult.error) {
          console.error(
            "Error fetching enrolled courses:",
            enrolledResult.error,
          );
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on mount

  const handleEnrollment = async (courseId: number, isEnrolled: boolean) => {
    if (!isAuthenticated) {
      window.location.href = `/auth?callbackUrl=${encodeURIComponent(window.location.pathname)}`;

      return;
    }

    setEnrollmentLoading((prev) => ({ ...prev, [courseId]: true }));

    try {
      let result;

      if (isEnrolled) {
        result = await unenrollFromCourse(courseId);
      } else {
        result = await enrollInCourse(courseId);
      }

      if (result.error) {
        console.error("Enrollment error:", result.error);
        showMessage("error", result.error);

        // If it's an auth error, update auth state
        if (
          result.error.includes("Authentication") ||
          result.error.includes("log in")
        ) {
          setIsAuthenticated(false);
        }
      } else {
        const action = isEnrolled ? "removed from" : "added to";

        showMessage("success", `Course ${action} your list!`);

        // Update enrollment status immediately for real-time UI updates
        setEnrollmentStatus((prev) => ({
          ...prev,
          [courseId]: !isEnrolled,
        }));

        // Update myCourses array for the toggle functionality
        if (isEnrolled) {
          // Remove course from myCourses
          setMyCourses((prev) =>
            prev.filter((course) => course.id !== courseId),
          );
        } else {
          // Add course to myCourses
          const courseToAdd = courses.find((c) => c.id === courseId);

          if (courseToAdd) {
            setMyCourses((prev) => [...prev, courseToAdd]);
          }
        }
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      showMessage(
        "error",
        "Failed to update course enrollment. Please try again.",
      );
    } finally {
      setEnrollmentLoading((prev) => ({ ...prev, [courseId]: false }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);

      setUploadedFiles((prev) => [...prev, ...fileNames]);
    }
  };

  const displayedCourses = showMyCoursesOnly ? myCourses : courses;
  const filteredCourses = displayedCourses.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error && !error.includes("Successfully")) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Failed to load courses</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
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

      {/* Upload Section */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          Upload Documents for Summarization
        </h2>
        <p className="text-muted-foreground mb-6">
          Upload your study materials, notes, or documents to get AI-powered
          summaries and insights.
        </p>

        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-lg font-medium mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, DOC, TXT, and other text formats
          </p>
          <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg cursor-pointer transition">
            Choose Files
            <input
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              type="file"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Uploaded Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg"
                >
                  <FileText className="text-gray-500" size={16} />
                  <span className="text-sm">{fileName}</span>
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                    Processing...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} />
            {showMyCoursesOnly ? "My Courses" : "Available Courses"}
          </h2>

          <div className="flex items-center gap-4">
            {/* My Courses Toggle */}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    showMyCoursesOnly
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => setShowMyCoursesOnly(!showMyCoursesOnly)}
                >
                  My Courses ({enrolledCoursesCount})
                </button>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Search courses..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrollmentStatus[course.id] || false;
            const isLoading = enrollmentLoading[course.id] || false;

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

                  {/* Enrollment Button */}
                  {isAuthenticated && (
                    <button
                      className={`p-2 rounded-lg transition ${
                        isEnrolled
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={isLoading}
                      title={
                        isEnrolled
                          ? "Remove from my courses"
                          : "Add to my courses"
                      }
                      onClick={() => handleEnrollment(course.id, isEnrolled)}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : isEnrolled ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {course.title || course.name}
                </h3>

                {course.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{course.students || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration || "Self-paced"}</span>
                  </div>
                </div>

                {/* Enrollment Status Indicator */}
                {isAuthenticated && isEnrolled && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <Check size={14} />
                    <span>Enrolled</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">
              {showMyCoursesOnly ? "No enrolled courses" : "No courses found"}
            </p>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms"
                : showMyCoursesOnly
                  ? "Start by adding some courses to your personal list"
                  : "No courses are currently available"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
