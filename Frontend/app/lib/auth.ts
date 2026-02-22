"use client";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

// API response from backend (matches your C# models)
export interface ProjectApiResponse {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface DetailedProjectApiResponse extends ProjectApiResponse {
  images: string[];
}

// Frontend models
export interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface DetailedProject extends Project {
  images: string[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  mainImage?: string;
  additionalImages?: string[];
}
export interface UpdateProjectRequest extends CreateProjectRequest {}

export class AuthService {
  private static TOKEN_KEY = "admin_token";

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  static async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
    this.clearToken();
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export class AdminAPI {
  private static getHeaders(): HeadersInit {
    const token = AuthService.getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  static async getAllProjects(): Promise<Project[]> {
    const response = await fetch("/api/admin/projects", {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch projects");
    
    const data: ProjectApiResponse[] = await response.json();
    
    // Map API response to frontend model
    return data.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
    }));
  }

  static async getProject(id: string): Promise<DetailedProject> {
    const response = await fetch(`/api/admin/projects/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Project not found");
    
    const data: DetailedProjectApiResponse = await response.json();
    
    // Map API response to frontend model
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      image: data.image,
      images: data.images,
    };
  }

  static async createProject(data: CreateProjectRequest): Promise<{ id: string }> {
    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  }

  static async updateProject(id: string, data: UpdateProjectRequest): Promise<void> {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to update project");
  }

  static async deleteProject(id: string): Promise<void> {
    const response = await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!response.ok) throw new Error("Failed to delete project");
  }
}