
export type JobStatus = 'idle' | 'running' | 'success' | 'failed' | 'paused';

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
