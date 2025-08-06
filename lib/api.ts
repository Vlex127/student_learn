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

// Helper function to get authentication token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("token");
  console.log(`🔑 Token check: ${token ? "Found" : "Missing"}`);
  
  if (token) {
    // Basic token validation (check if it looks like a JWT)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("⚠️ Invalid token format - not a valid JWT");
      return null;
    }
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn("⚠️ Token has expired");
        localStorage.removeItem("token"); // Clean up expired token
        return null;
      }
      
      console.log(`✅ Token valid, expires: ${new Date(payload.exp * 1000).toLocaleString()}`);
    } catch (e) {
      console.warn("⚠️ Could not parse token payload");
    }
  }
  
  return token;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    console.log(`🔍 API Call: ${API_BASE_URL}${endpoint}`);
    
    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add any custom headers from options
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }
    
    console.log(`📋 Request headers:`, Object.keys(headers));
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      
      // Special handling for authentication errors
      if (response.status === 401) {
        console.error("🚫 Authentication failed - token may be invalid or expired");
        // Clear potentially invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        return { 
          error: "Authentication failed. Please log in again." 
        };
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: Received ${Array.isArray(data) ? data.length : 1} item(s)`);

    return { data };
  } catch (error) {
    console.error(`❌ API Call failed for ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Provide more helpful error messages
    if (errorMessage.includes('Failed to fetch')) {
      return { 
        error: `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the server is running.` 
      };
    }
    
    return { error: errorMessage };
  }
}

// Get courses/subjects for library
export async function getCourses(): Promise<ApiResponse<Course[]>> {
  console.log("📚 Fetching courses from backend...");
  return apiCall<Course[]>("/library/courses");
}

// Get practice subjects (fallback)
export async function getPracticeSubjects(): Promise<
  ApiResponse<{ subjects: Course[] }>
> {
  console.log("📚 Fetching practice subjects from backend...");
  return apiCall<{ subjects: Course[] }>("/practice/subjects");
}

// Get a single course by ID
export async function getCourseById(courseId: number): Promise<ApiResponse<Course>> {
  const token = getAuthToken();
  if (!token) {
    console.warn("No authentication token available");
    return { error: "Authentication required" };
  }

  return apiCall<Course>(`/subjects/${courseId}`, {
    method: "GET",  // Explicitly specify GET method
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
  });
}

// User Enrollment API functions
export async function enrollInCourse(courseId: number): Promise<ApiResponse<any>> {
  console.log(`📝 Enrolling in course ${courseId}...`);
  const token = getAuthToken();
  
  if (!token) {
    return { error: "Authentication required. Please log in to enroll in courses." };
  }
  
  return apiCall<any>(`/enrollments/${courseId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function unenrollFromCourse(courseId: number): Promise<ApiResponse<any>> {
  console.log(`❌ Unenrolling from course ${courseId}...`);
  const token = getAuthToken();
  
  if (!token) {
    return { error: "Authentication required. Please log in to manage your courses." };
  }
  
  return apiCall<any>(`/enrollments/${courseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getMyEnrolledCourses(): Promise<ApiResponse<Course[]>> {
  console.log("📚 Fetching my enrolled courses...");
  const token = getAuthToken();
  
  if (!token) {
    return { error: "Authentication required. Please log in to view your courses." };
  }
  
  return apiCall<Course[]>("/my-courses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function checkEnrollmentStatus(courseId: number): Promise<ApiResponse<{ is_enrolled: boolean }>> {
  console.log(`🔍 Checking enrollment status for course ${courseId}...`);
  const token = getAuthToken();
  
  if (!token) {
    return { data: { is_enrolled: false } }; // Return false if not authenticated
  }
  
  return apiCall<{ is_enrolled: boolean }>(`/enrollments/check/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// USER: Get user statistics
export async function getUserStatistics(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/auth/me/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// USER: Get practice history
export async function getPracticeHistory(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/my-courses/practice-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get all users
export async function adminGetUsers(): Promise<ApiResponse<any[]>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any[]>(`/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get user details
export async function adminGetUser(userId: number): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Update user
export async function adminUpdateUser(userId: number, data: any): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/users/${userId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ADMIN: Toggle admin status
export async function adminToggleUserAdmin(userId: number): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/users/${userId}/toggle-admin`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get system statistics
export async function adminGetStatistics(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get system health
export async function adminGetSystemHealth(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/system/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get enrollments
export async function adminGetEnrollments(): Promise<ApiResponse<any[]>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any[]>(`/admin/enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get practice analytics
export async function adminGetPracticeAnalytics(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/practice-analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get subject analytics
export async function adminGetSubjectAnalytics(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/subjects/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get question statistics
export async function adminGetQuestionStatistics(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/questions/statistics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ADMIN: Get system logs (placeholder)
export async function adminGetSystemLogs(): Promise<ApiResponse<any>> {
  const token = getAuthToken();
  if (!token) return { error: "Authentication required." };
  return apiCall<any>(`/admin/system/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
