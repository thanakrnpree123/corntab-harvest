export type Permission = "view" | "create" | "update" | "delete";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  endpoint: string; // Changed from command to endpoint
  httpMethod: string; // Added HTTP method
  requestBody?: string; // Added request body
  description?: string;
  projectId: string;
  status: string;
  useLocalTime: boolean;
  timezone: string;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string;
  successCount:number;
  failCount:number;
  averageRuntime:any;
}

export interface JobLog {
  id: string;
  jobId: string;
  status: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  output: string;
  error: string | null;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role;
  roleId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "idle" | "running" | "success" | "failed" | "paused";

