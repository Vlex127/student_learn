'use client';

import React, { useEffect, useState } from "react";
import { getUserStatistics, getPracticeHistory, getMyEnrolledCourses, unenrollFromCourse, Course, ApiResponse, transformCourseForUI } from "@/lib/api";
import { Award, BookOpen, TrendingUp, Clock, CheckCircle, Play, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unenrollLoading, setUnenrollLoading] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, historyRes, coursesRes] = await Promise.all([
          getUserStatistics(),
          getPracticeHistory(),
          getMyEnrolledCourses(),
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (historyRes.data) setPracticeHistory(historyRes.data.practice_sessions || []);
        if (coursesRes.data) setCourses(coursesRes.data.map(transformCourseForUI));
        setError(null);
      } catch (e) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUnenroll = async (courseId: number, courseName: string) => {
    if (!confirm(`Are you sure you want to unenroll from "${courseName}"?`)) return;
    setUnenrollLoading(prev => ({ ...prev, [courseId]: true }));
    try {
      const result = await unenrollFromCourse(courseId);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: `Unenrolled from ${courseName}` });
        setCourses(prev => prev.filter(c => c.id !== courseId));
      }
    } catch (e) {
      setMessage({ type: "error", text: "Failed to unenroll" });
    } finally {
      setUnenrollLoading(prev => ({ ...prev, [courseId]: false }));
    }
  };

  if (loading) {
    return <div className="container mx-auto py-12 text-center">Loading profile...</div>;
  }
  if (error) {
    return <div className="container mx-auto py-12 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold mb-2">My Profile</h1>
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : message.type === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <div className="flex items-center justify-between">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-current hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {/* User Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border flex flex-col items-center">
            <Award className="text-indigo-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{stats.statistics?.total_sessions ?? 0}</div>
            <div className="text-muted-foreground">Practice Sessions</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border flex flex-col items-center">
            <TrendingUp className="text-green-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{stats.statistics?.average_score ?? 0}</div>
            <div className="text-muted-foreground">Average Score</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border flex flex-col items-center">
            <BookOpen className="text-blue-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{courses.length}</div>
            <div className="text-muted-foreground">Courses Enrolled</div>
          </div>
        </div>
      )}
      {/* Enrolled Courses */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={20} /> Enrolled Courses
        </h2>
        {courses.length === 0 ? (
          <div className="text-muted-foreground">You are not enrolled in any courses.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="text-indigo-600" size={20} />
                  <span className="font-semibold">{course.title || course.name}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-2 line-clamp-2">{course.description}</div>
                <div className="flex-1"></div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-1 rounded-lg text-sm"
                  >Continue</button>
                  <button
                    onClick={() => handleUnenroll(course.id, course.name)}
                    disabled={unenrollLoading[course.id]}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                  >{unenrollLoading[course.id] ? "..." : "Unenroll"}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Practice History */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} /> Practice History
        </h2>
        {practiceHistory.length === 0 ? (
          <div className="text-muted-foreground">No practice sessions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800">
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Score</th>
                  <th className="p-2 text-left">Correct</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {practiceHistory.map((session, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{session.subject?.name || "-"}</td>
                    <td className="p-2">{session.score}</td>
                    <td className="p-2">{session.correct_answers}</td>
                    <td className="p-2">{session.total_questions}</td>
                    <td className="p-2">{session.time_taken}s</td>
                    <td className="p-2">{session.completed_at ? new Date(session.completed_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}