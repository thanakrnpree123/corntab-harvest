
// Job related types
export type JobStatus = 'running' | 'paused' | 'success' | 'failed' | 'idle';

export interface Job {
  id: string;
  name: string;
  description: string;
  schedule: string;
  command: string;
  status: JobStatus;
  lastRun?: string | null;
  nextRun?: string | null;
  createdAt: string;
  updatedAt: string;
}

// CronJob type (extended Job)
export interface CronJob {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  status: JobStatus;
  endpoint: string;
  httpMethod: string;
  requestBody?: string;
  projectId: string;
  timezone?: string;
  useLocalTime?: boolean;
  lastRun?: string | null;
  nextRun?: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  successCount?: number;
  failCount?: number;
  averageRuntime?: number | null;
  emailNotifications?: string | null;
}

// Log related types
export interface JobLog {
  id: string;
  jobId: string;
  startTime: string | null;
  endTime: string | null;
  duration?: number;
  status: string;
  output: string;
  error?: string;
  createdAt?: string;
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role | 'admin' | 'user' | 'viewer';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Project type
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Role and Permission types
export type Permission = 'view' | 'create' | 'update' | 'delete';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
