"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CourseDetailPage() {
  const params = useParams();
  const { id: courseId } = params;
  const [course, setCourse] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    setLoading(true);
    setError("");
    // Fetch course info
    fetch("http://localhost:8000/subjects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find(
            (c: any) => String(c.id) === String(courseId),
          );

          setCourse(found || null);
        }
      })
      .catch(() => setError("Failed to fetch course info"));
    // Fetch course contents
    fetch(`http://localhost:8000/subjects/${courseId}/contents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setContents(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to fetch course contents"))
      .finally(() => setLoading(false));
  }, [courseId]);

  return (
    <div className="p-8">
      {loading && (
        <div className="animate-pulse h-8 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded mb-4" />
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {course && (
        <>
          <h1 className="text-2xl font-bold mb-2">{course.name}</h1>
          <p className="mb-6 text-muted-foreground">{course.description}</p>
        </>
      )}
      <h2 className="text-xl font-semibold mb-4">Course Contents</h2>
      <div className="space-y-6">
        {contents.map((content) => (
          <Link
            key={content.id}
            className="block bg-white dark:bg-zinc-900 rounded-xl p-6 border shadow-sm hover:shadow-lg transition mb-4"
            href={`/admin/library/${courseId}/content/${content.id}`}
          >
            <div className="font-bold text-lg mb-2">{content.title}</div>
            <div className="text-base text-muted-foreground whitespace-pre-line line-clamp-2">
              {content.body}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Created: {new Date(content.created_at).toLocaleString()}
            </div>
          </Link>
        ))}
        {!loading && contents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No content found for this course.
          </div>
        )}
      </div>
    </div>
  );
}
