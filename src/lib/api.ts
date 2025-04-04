import { ApiResponse, Project, CronJob, User, Role, JobLog, JobStatus } from '@/lib/types';

const API_BASE_URL = 'http://localhost:3000/api';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error || `Error: ${response.status} ${response.statusText}`
    };
  }
  return await response.json();
}

const createMockResponse = <T>(data: T): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, 500); // Simulate network delay
  });
};

export const projectApi = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        return handleResponse<Project[]>(response);
      } catch (error) {
        console.warn("Using mock projects due to API error:", error);
        const mockProjects: Project[] = [
          {
            id: "1",
            name: "API Services",
            description: "API monitoring and management",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "Data Processing",
            description: "Background data processing tasks",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        return createMockResponse(mockProjects);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Project>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);
        return handleResponse<Project>(response);
      } catch (error) {
        console.warn("Using mock project due to API error:", error);
        const mockProject: Project = {
          id,
          name: id === "1" ? "API Services" : "Data Processing",
          description: id === "1" ? "API monitoring and management" : "Background data processing tasks",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockProject);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        });
        return handleResponse<Project>(response);
      } catch (error) {
        console.warn("Using mock create project due to API error:", error);
        const newProject: Project = {
          ...project,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(newProject);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(project)
        });
        return handleResponse<Project>(response);
      } catch (error) {
        console.warn("Using mock update project due to API error:", error);
        const mockProject: Project = {
          id,
          name: project.name || "Updated Project",
          description: project.description || "Updated description",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockProject);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
          method: 'DELETE'
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.warn("Using mock delete project due to API error:", error);
        return createMockResponse<void>(undefined);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const jobApi = {
  getAll: async (projectId?: string): Promise<ApiResponse<CronJob[]>> => {
    try {
      try {
        const url = projectId 
          ? `${API_BASE_URL}/jobs?projectId=${projectId}`
          : `${API_BASE_URL}/jobs`;
        
        const response = await fetch(url);
        return handleResponse<CronJob[]>(response);
      } catch (error) {
        console.warn("Using mock jobs due to API error:", error);
        const mockJobs: CronJob[] = [];
        const statuses: JobStatus[] = ["idle", "running", "success", "failed", "paused"];
        const methods = ["GET", "POST", "PUT", "DELETE"];
        
        for (let i = 1; i <= 10; i++) {
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          mockJobs.push({
            id: `job-${i}`,
            name: `Job ${i}`,
            schedule: "0 */6 * * *",
            endpoint: `https://api.example.com/endpoint-${i}`,
            httpMethod: methods[i % methods.length],
            requestBody: i % 2 === 0 ? JSON.stringify({ test: true }) : undefined,
            description: `This is a mock job ${i}`,
            projectId: projectId || (i % 2 === 0 ? "1" : "2"),
            status: randomStatus,
            useLocalTime: i % 3 === 0,
            timezone: "UTC",
            lastRun: i % 2 === 0 ? new Date().toISOString() : null,
            nextRun: new Date(Date.now() + 3600000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [`tag-${i}`, "mock"],
            successCount: Math.floor(Math.random() * 50),
            failCount: Math.floor(Math.random() * 10),
            averageRuntime: Math.random() * 2000,
            emailNotifications: i % 3 === 0 ? "test@example.com" : null
          });
        }
        
        if (projectId) {
          return createMockResponse(mockJobs?.filter(job => job.projectId === projectId));
        }
        return createMockResponse(mockJobs);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<CronJob>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
        return handleResponse<CronJob>(response);
      } catch (error) {
        console.warn("Using mock job details due to API error:", error);
        const mockJob: CronJob = {
          id,
          name: `Job ${id}`,
          schedule: "0 */6 * * *",
          endpoint: `https://api.example.com/endpoint-${id}`,
          httpMethod: "GET",
          description: `This is a mock job ${id}`,
          projectId: "1",
          status: "idle",
          useLocalTime: false,
          timezone: "UTC",
          lastRun: null,
          nextRun: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [`tag-${id}`, "mock"],
          successCount: 5,
          failCount: 1,
          averageRuntime: 1500,
          emailNotifications: null
        };
        return createMockResponse(mockJob);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (job: Omit<CronJob, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastRun' | 'nextRun' | 'successCount' | 'failCount' | 'averageRuntime'>): Promise<ApiResponse<CronJob>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job)
        });
        return handleResponse<CronJob>(response);
      } catch (error) {
        console.warn("Using mock create job due to API error:", error);
        const newJob: CronJob = {
          ...job,
          id: `job-${Math.random().toString(36).substr(2, 9)}`,
          status: "idle",
          lastRun: null,
          nextRun: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          successCount: 0,
          failCount: 0,
          averageRuntime: null,
          tags: job.tags || []
        };
        return createMockResponse(newJob);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, job: Partial<CronJob>): Promise<ApiResponse<CronJob>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(job)
        });
        return handleResponse<CronJob>(response);
      } catch (error) {
        console.warn("Using mock update job due to API error:", error);
        const mockJob: CronJob = {
          id,
          name: job.name || `Job ${id}`,
          schedule: job.schedule || "0 */6 * * *",
          endpoint: job.endpoint || `https://api.example.com/endpoint-${id}`,
          httpMethod: job.httpMethod || "GET",
          requestBody: job.requestBody,
          description: job.description || `Updated description for job ${id}`,
          projectId: job.projectId || "1",
          status: job.status || "idle",
          useLocalTime: job.useLocalTime !== undefined ? job.useLocalTime : false,
          timezone: job.timezone || "UTC",
          lastRun: job.lastRun || null,
          nextRun: job.nextRun || new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: job.tags || [],
          successCount: job.successCount !== undefined ? job.successCount : 0,
          failCount: job.failCount !== undefined ? job.failCount : 0,
          averageRuntime: job.averageRuntime || null,
          emailNotifications: job.emailNotifications || null
        };
        return createMockResponse(mockJob);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
          method: 'DELETE'
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.warn("Using mock delete job due to API error:", error);
        return createMockResponse<void>(undefined);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  duplicate: async (id: string): Promise<ApiResponse<CronJob>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}/duplicate`, {
          method: 'POST'
        });
        return handleResponse<CronJob>(response);
      } catch (error) {
        console.warn("Using mock duplicate job due to API error:", error);
        const getJobResult = await jobApi.getById(id);
        if (!getJobResult.success || !getJobResult.data) {
          throw new Error("Failed to get job to duplicate");
        }
        
        const originalJob = getJobResult.data;
        const duplicatedJob: CronJob = {
          ...originalJob,
          id: `job-${Math.random().toString(36).substr(2, 9)}`,
          name: `Copy of ${originalJob.name}`,
          status: "idle",
          lastRun: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          successCount: 0,
          failCount: 0
        };
        return createMockResponse(duplicatedJob);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getLogs: async (id: string): Promise<ApiResponse<JobLog[]>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}/logs`);
        return handleResponse<JobLog[]>(response);
      } catch (error) {
        console.warn("Using mock job logs due to API error:", error);
        const mockLogs: JobLog[] = [];
        const statuses = ["success", "failed", "running"];
        
        for (let i = 1; i <= 15; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const startTime = new Date(Date.now() - (i * 3600000));
          const endTime = status !== "running" ? new Date(startTime.getTime() + Math.floor(Math.random() * 60000)) : null;
          const duration = endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : null;
          
          mockLogs.push({
            id: `log-${i}`,
            jobId: id,
            status,
            startTime: startTime.toISOString(),
            endTime: endTime ? endTime.toISOString() : null,
            duration,
            output: status === "success" ? "Task completed successfully" : "Processing...",
            error: status === "failed" ? "Error: Connection timeout" : null,
            createdAt: startTime.toISOString()
          });
        }
        
        return createMockResponse(mockLogs);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  createJobLog: async (jobId: string, logData: any): Promise<ApiResponse<JobLog>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        return handleResponse<JobLog>(response);
      } catch (error) {
        console.warn("Using mock create job log due to API error:", error);
        const newLog: JobLog = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          jobId,
          status: logData.status || "success",
          startTime: logData.startTime || new Date().toISOString(),
          endTime: logData.endTime || null,
          duration: logData.duration || null,
          output: logData.output || "Task created",
          error: logData.error || null,
          createdAt: new Date().toISOString()
        };
        return createMockResponse(newLog);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        return handleResponse<User[]>(response);
      } catch (error) {
        console.warn("Using mock users due to API error:", error);
        const mockUsers: User[] = [
          {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            roleId: "1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "Regular User",
            email: "user@example.com",
            roleId: "2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        return createMockResponse(mockUsers);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`);
        return handleResponse<User>(response);
      } catch (error) {
        console.warn("Using mock user details due to API error:", error);
        const mockUser: User = {
          id,
          name: `User ${id}`,
          email: `user${id}@example.com`,
          roleId: "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockUser);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        return handleResponse<User>(response);
      } catch (error) {
        console.warn("Using mock create user due to API error:", error);
        const newUser: User = {
          ...user,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(newUser);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        return handleResponse<User>(response);
      } catch (error) {
        console.warn("Using mock update user due to API error:", error);
        const mockUser: User = {
          id,
          name: user.name || `User ${id}`,
          email: user.email || `user${id}@example.com`,
          roleId: user.roleId || "1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockUser);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: 'DELETE'
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.warn("Using mock delete user due to API error:", error);
        return createMockResponse<void>(undefined);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export const roleApi = {
  getAll: async (): Promise<ApiResponse<Role[]>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/roles`);
        return handleResponse<Role[]>(response);
      } catch (error) {
        console.warn("Using mock roles due to API error:", error);
        const mockRoles: Role[] = [
          {
            id: "1",
            name: "Admin",
            permissions: ["view", "create", "update", "delete"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            name: "User",
            permissions: ["view"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        return createMockResponse(mockRoles);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Role>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`);
        return handleResponse<Role>(response);
      } catch (error) {
        console.warn("Using mock role details due to API error:", error);
        const mockRole: Role = {
          id,
          name: `Role ${id}`,
          permissions: ["view", "create", "update", "delete"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockRole);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Role>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(role)
        });
        return handleResponse<Role>(response);
      } catch (error) {
        console.warn("Using mock create role due to API error:", error);
        const newRole: Role = {
          ...role,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(newRole);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, role: Partial<Role>): Promise<ApiResponse<Role>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(role)
        });
        return handleResponse<Role>(response);
      } catch (error) {
        console.warn("Using mock update role due to API error:", error);
        const mockRole: Role = {
          id,
          name: role.name || `Role ${id}`,
          permissions: role.permissions || ["view"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return createMockResponse(mockRole);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      try {
        const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
          method: 'DELETE'
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.warn("Using mock delete role due to API error:", error);
        return createMockResponse<void>(undefined);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/**
 * Fetches all jobs, optionally filtered by project ID
 * @param {Object} params - Optional parameters
 * @param {string} [params.projectId] - Optional project ID to filter jobs
 * @returns {Promise<Array>} - Array of job objects
 */
export async function fetchJobs({ projectId } = {}) {
  const response = await jobApi.getAll(projectId);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch jobs');
  }
  
  return response.data;
}

/**
 * Toggles a job's status between active and paused
 * @param {string} jobId - The ID of the job to toggle
 * @param {string} currentStatus - The current job status
 * @returns {Promise<Object>} - Updated job object
 */
export async function toggleJobStatus(jobId, currentStatus) {
  const newStatus = currentStatus === 'paused' ? 'idle' : 'paused';
  
  const response = await jobApi.update(jobId, { status: newStatus });
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to update job status');
  }
  
  return response.data;
}

/**
 * Deletes a job by ID
 * @param {string} jobId - The ID of the job to delete
 * @returns {Promise<void>}
 */
export async function deleteJob(jobId) {
  const response = await jobApi.delete(jobId);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to delete job');
  }
  
  return response.data;
}

/**
 * Duplicates a job by ID
 * @param {string} jobId - The ID of the job to duplicate
 * @returns {Promise<Object>} - Duplicated job object
 */
export async function duplicateJob(jobId) {
  const response = await jobApi.duplicate(jobId);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to duplicate job');
  }
  
  return response.data;
}

/**
 * Fetches dashboard summary data
 * @returns {Promise<Object>} - Dashboard summary data
 */
export async function fetchDashboardData() {
  // Get projects, jobs, and calculate statistics
  const [projectsResponse, jobsResponse] = await Promise.all([
    projectApi.getAll(),
    jobApi.getAll()
  ]);
  
  if (!projectsResponse.success || !jobsResponse.success) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  const projects = projectsResponse.data;
  const jobs = jobsResponse.data;
  
  // Calculate summary statistics
  const totalProjects = projects.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs?.filter(job => job.status !== 'paused').length;
  const failedJobs = jobs?.filter(job => job.status === 'failed').length;
  
  // Calculate success rate
  const totalRuns = jobs.reduce((sum, job) => sum + job.successCount + job.failCount, 0);
  const successRate = totalRuns > 0 
    ? Math.round((jobs.reduce((sum, job) => sum + job.successCount, 0) / totalRuns) * 100) 
    : 100;
  
  // Get recent logs from all jobs to show activity
  const recentActivityPromises = jobs.slice(0, 5).map(job => jobApi.getLogs(job.id));
  const recentActivityResponses = await Promise.all(recentActivityPromises);
  const recentActivity = recentActivityResponses?.filter(response => response.success)
    .flatMap(response => response.data || [])
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 10);
  
  return {
    summary: {
      totalProjects,
      totalJobs,
      activeJobs,
      failedJobs,
      successRate
    },
    recentActivity,
    projects,
    jobs
  };
}

/**
 * Fetches user notifications 
 * @returns {Promise<Array>} - Array of notification objects
 */
export async function fetchUserNotifications() {
  // This is a mock implementation since the original API doesn't have a notifications endpoint
  // In a real implementation, this would call a notifications API endpoint
  
  // Generate mock notifications based on job statuses
  const jobsResponse = await jobApi.getAll();
  
  if (!jobsResponse.success) {
    throw new Error('Failed to fetch notifications');
  }
  
  const jobs = jobsResponse.data;
  const notifications = [];
  
  // Create notifications for failed jobs
  const failedJobs = jobs?.filter(job => job.status === 'failed');
  failedJobs.forEach(job => {
    notifications.push({
      id: `notification-failed-${job.id}`,
      type: 'error',
      message: `Job "${job.name}" failed to run`,
      timestamp: job.lastRun || new Date().toISOString(),
      read: false,
      jobId: job.id
    });
  });
  
  // Create notifications for jobs that haven't run in a while
  const currentTime = new Date();
  const inactiveJobs = jobs?.filter(job => {
    if (!job.lastRun || job.status === 'paused') return false;
    const lastRunTime = new Date(job.lastRun);
    const daysSinceLastRun = (currentTime - lastRunTime) / (1000 * 60 * 60 * 24);
    return daysSinceLastRun > 7;
  });
  
  inactiveJobs.forEach(job => {
    notifications.push({
      id: `notification-inactive-${job.id}`,
      type: 'warning',
      message: `Job "${job.name}" hasn't run in over a week`,
      timestamp: new Date().toISOString(),
      read: false,
      jobId: job.id
    });
  });
  
  // Sort notifications by timestamp (newest first)
  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
