
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
}

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  updatedAt: string;
}
