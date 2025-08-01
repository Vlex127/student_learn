"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-xl p-8 border shadow-sm animate-pulse h-32 flex flex-col justify-center"
        >
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded mb-4" />
          <div className="h-4 w-2/3 bg-gray-100 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function AdminLibraryPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [addName, setAddName] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  function fetchCourses() {
    setLoading(true);
    setError("");
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    if (!token) return;
    fetch("http://localhost:8000/subjects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to fetch courses"))
      .finally(() => setLoading(false));
  }

  function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    fetch("http://localhost:8000/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: addName, description: addDesc }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add course");
        setAddName("");
        setAddDesc("");
        fetchCourses();
      })
      .catch(() => setError("Failed to add course"))
      .finally(() => setAdding(false));
  }

  function handleDeleteCourses() {
    if (selected.length === 0) return;
    setDeleting(true);
    setError("");
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("token")
        : null;

    Promise.all(
      selected.map((id) =>
        fetch(`http://localhost:8000/subjects/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ),
    )
      .then(() => {
        setSelected([]);
        fetchCourses();
      })
      .catch(() => setError("Failed to delete course(s)"))
      .finally(() => setDeleting(false));
  }

  function toggleSelect(id: number) {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id],
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Data Library</h1>
      <p className="mb-6">
        Here you can manage your data library files or content.
      </p>
      <h2 className="text-xl font-semibold mb-2">Courses</h2>
      {/* Add Course Form */}
      <form
        className="flex flex-col md:flex-row gap-2 mb-6"
        onSubmit={handleAddCourse}
      >
        <input
          required
          className="border rounded px-3 py-2 flex-1"
          placeholder="Course name (e.g. CSC 122)"
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Description"
          type="text"
          value={addDesc}
          onChange={(e) => setAddDesc(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          disabled={adding}
          type="submit"
        >
          {adding ? "Adding..." : "Add Course"}
        </button>
      </form>
      {/* Delete Button */}
      {selected.length > 0 && (
        <button
          className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          disabled={deleting}
          onClick={handleDeleteCourses}
        >
          {deleting ? "Deleting..." : `Delete Selected (${selected.length})`}
        </button>
      )}
      {loading && <CoursesSkeleton />}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            className={`bg-white dark:bg-zinc-900 rounded-xl p-8 border shadow-sm flex items-start gap-4 transition hover:shadow-lg ${selected && selected.includes(course.id) ? "ring-2 ring-red-500" : ""}`}
            href={`/admin/library/${course.id}`}
          >
            <input
              checked={selected && selected.includes(course.id)}
              className="mt-1"
              type="checkbox"
              onChange={(e) => {
                e.preventDefault();
                toggleSelect(course.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <div className="font-bold text-lg mb-2">{course.name}</div>
              <div className="text-base text-muted-foreground">
                {course.description}
              </div>
            </div>
          </Link>
        ))}
        {!loading && courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <span className="text-lg font-medium mb-2">No courses found.</span>
          </div>
        )}
      </div>
    </div>
  );
}
