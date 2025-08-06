// lib/auth.ts
const API_BASE_URL = "http://127.0.0.1:8000";

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = "token";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(errorData.detail || "Login failed");
    }

    const data: LoginResponse = await response.json();
    this.setToken(data.access_token);

    // Fetch user info
    const user = await this.getCurrentUser();
    return user;
  }

  static async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        password, 
        full_name: fullName,
        is_admin: false 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(errorData.detail || "Registration failed");
    }

    // Auto-login after registration
    return await this.login(email, password);
  }

  static async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
        throw new Error("Authentication expired. Please login again.");
      }
      throw new Error("Failed to fetch user info");
    }

    return await response.json();
  }

  static logout(): void {
    this.removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }

  static async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }
      throw new Error("Authentication expired. Please login again.");
    }

    return response;
  }
}
