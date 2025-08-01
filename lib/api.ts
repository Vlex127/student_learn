const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Course {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  // UI-specific properties
  title?: string;
  students?: number;
  duration?: string;
  color?: string;
}

// Transform backend course data for UI
export function transformCourseForUI(course: Course): Course {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-teal-500",
  ];

  return {
    ...course,
    title: course.name,
    students: Math.floor(Math.random() * 200) + 50, // Mock student count
    duration: "16 weeks", // Default duration
    color: colors[course.id % colors.length],
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return { data };
  } catch (error) {
    // Log error for debugging purposes
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Get courses/subjects for library
export async function getCourses(): Promise<ApiResponse<Course[]>> {
  return apiCall<Course[]>("/library/courses");
}

// Get practice subjects (fallback)
export async function getPracticeSubjects(): Promise<
  ApiResponse<{ subjects: Course[] }>
> {
  return apiCall<{ subjects: Course[] }>("/practice/subjects");
}
