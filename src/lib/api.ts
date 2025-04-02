
import { ApiResponse, Project, CronJob, User, Role } from '@/lib/types';

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

// Project API methods
export const projectApi = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      return handleResponse<Project[]>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      return handleResponse<Project>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      return handleResponse<Project>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, project: Partial<Project>): Promise<ApiResponse<Project>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      return handleResponse<Project>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE'
      });
      return handleResponse<void>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// CronJob API methods
export const jobApi = {
  getAll: async (projectId?: string): Promise<ApiResponse<CronJob[]>> => {
    try {
      const url = projectId 
        ? `${API_BASE_URL}/jobs?projectId=${projectId}`
        : `${API_BASE_URL}/jobs`;
      
      const response = await fetch(url);
      return handleResponse<CronJob[]>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<CronJob>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
      return handleResponse<CronJob>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (job: Omit<CronJob, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastRun' | 'nextRun' | 'successCount' | 'failCount' | 'averageRuntime'>): Promise<ApiResponse<CronJob>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      return handleResponse<CronJob>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, job: Partial<CronJob>): Promise<ApiResponse<CronJob>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      return handleResponse<CronJob>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: 'DELETE'
      });
      return handleResponse<void>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  duplicate: async (id: string): Promise<ApiResponse<CronJob>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}/duplicate`, {
        method: 'POST'
      });
      return handleResponse<CronJob>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getLogs: async (id: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${id}/logs`);
      return handleResponse<any[]>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// User API methods
export const userApi = {
  getAll: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      return handleResponse<User[]>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      return handleResponse<User>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return handleResponse<User>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, user: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return handleResponse<User>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      return handleResponse<void>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Role API methods
export const roleApi = {
  getAll: async (): Promise<ApiResponse<Role[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      return handleResponse<Role[]>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getById: async (id: string): Promise<ApiResponse<Role>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`);
      return handleResponse<Role>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  create: async (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Role>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role)
      });
      return handleResponse<Role>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  update: async (id: string, role: Partial<Role>): Promise<ApiResponse<Role>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role)
      });
      return handleResponse<Role>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'DELETE'
      });
      return handleResponse<void>(response);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
