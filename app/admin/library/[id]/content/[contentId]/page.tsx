"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ContentDetailPage() {
  const params = useParams();
  const { id: courseId, contentId } = params;
  const [content, setContent] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId || !contentId) return;
    const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    setLoading(true);
    setError("");
    console.log('Fetching lessons for contentId:', contentId);
    // Fetch content info
    fetch(`http://localhost:8000/subjects/${courseId}/contents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((c: any) => String(c.id) === String(contentId));
          setContent(found || null);
        }
      })
      .catch(() => setError("Failed to fetch content"));
    // Fetch lessons for this content
    fetch(`http://localhost:8000/contents/${contentId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setLessons(Array.isArray(data) ? data : []);
        console.log('Fetched lessons:', data);
      })
      .catch(() => setError("Failed to fetch lessons"))
      .finally(() => setLoading(false));
  }, [courseId, contentId]);

  return (
    <div className="p-8">
      {loading && <div className="animate-pulse h-8 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded mb-4" />}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {content && (
        <>
          <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
          <div className="mb-6 text-muted-foreground">{content.body}</div>
          <div className="text-xs text-gray-400 mt-2 mb-6">Created: {new Date(content.created_at).toLocaleString()}</div>
        </>
      )}
      <h2 className="text-xl font-semibold mb-4">Lessons</h2>
      <div className="space-y-6">
        {lessons.map(lesson => (
          <div key={lesson.id} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border shadow-sm mb-4">
            <div className="font-bold text-lg mb-2">{lesson.title}</div>
            <div className="text-base text-muted-foreground whitespace-pre-line">{lesson.body}</div>
            <div className="text-xs text-gray-400 mt-2">Created: {new Date(lesson.created_at).toLocaleString()}</div>
          </div>
        ))}
        {!loading && lessons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No lessons found for this content.</div>
        )}
      </div>
    </div>
  );
}
