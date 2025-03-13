
export type JobStatus = 'idle' | 'running' | 'success' | 'failed' | 'paused';

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
  command: string;
  schedule: string;
  status: JobStatus;
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  failCount?: number;
  successCount?: number;
  averageRuntime?: number; // in seconds
  projectId: string; // Added project reference
}

export interface JobLog {
  id: string;
  jobId: string;
  status: JobStatus;
  startTime: string;
  endTime: string | null;
  duration: number | null; // in seconds
  output: string;
  error: string | null;
}

export type Permission = 'view' | 'create' | 'update';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}
