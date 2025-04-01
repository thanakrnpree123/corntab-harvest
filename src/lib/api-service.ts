
import { ApiResponse, CronJob, JobLog, Project, User, Role, Permission } from './types';

const API_URL = 'http://localhost:3000/api';

// คลาสสำหรับจัดการการเชื่อมต่อกับ backend API
class ApiService {
  private token: string | null = null;

  // ตั้งค่า token สำหรับการยืนยันตัวตน
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // ดึง token จาก localStorage
  loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
    return this.token;
  }

  // ลบ token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // สร้าง headers สำหรับ API requests
  private getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // ส่ง request ไปยัง API
  private async fetchWithAuth<T>(
    endpoint: string, 
    method: string = 'GET', 
    body?: any
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error: ${response.status}`,
        };
      }
      
      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // ---------- User Authentication ----------

  // ลงทะเบียนผู้ใช้ใหม่
  async register(name: string, email: string, password: string): Promise<ApiResponse<User>> {
    return this.fetchWithAuth<User>('/auth/register', 'POST', { name, email, password });
  }

  // เข้าสู่ระบบ
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.fetchWithAuth<{ user: User; token: string }>('/auth/login', 'POST', { email, password });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  // ออกจากระบบ
  logout() {
    this.clearToken();
    return { success: true, message: 'Logged out successfully' };
  }

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  async validateAuth(): Promise<ApiResponse<{ user: User; isValid: boolean }>> {
    const token = this.loadToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }
    
    return this.fetchWithAuth<{ user: User; isValid: boolean }>('/auth/validate', 'POST', { token });
  }

  // ---------- Projects ----------

  // ดึงข้อมูลโปรเจคทั้งหมด
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.fetchWithAuth<Project[]>('/projects');
  }

  // ดึงข้อมูลโปรเจคตาม ID
  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.fetchWithAuth<Project>(`/projects/${id}`);
  }

  // สร้างโปรเจคใหม่
  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.fetchWithAuth<Project>('/projects', 'POST', projectData);
  }

  // อัพเดทโปรเจค
  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.fetchWithAuth<Project>(`/projects/${id}`, 'PUT', projectData);
  }

  // ลบโปรเจค
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth<void>(`/projects/${id}`, 'DELETE');
  }

  // ---------- Jobs ----------

  // ดึงข้อมูลงานทั้งหมด
  async getJobs(): Promise<ApiResponse<CronJob[]>> {
    return this.fetchWithAuth<CronJob[]>('/jobs');
  }

  // ดึงข้อมูลงานตามโปรเจค
  async getJobsByProject(projectId: string): Promise<ApiResponse<CronJob[]>> {
    return this.fetchWithAuth<CronJob[]>(`/jobs/project/${projectId}`);
  }

  // ดึงข้อมูลงานตาม ID
  async getJob(id: string): Promise<ApiResponse<CronJob>> {
    return this.fetchWithAuth<CronJob>(`/jobs/${id}`);
  }

  // สร้างงานใหม่
  async createJob(jobData: Partial<CronJob>): Promise<ApiResponse<CronJob>> {
    return this.fetchWithAuth<CronJob>('/jobs', 'POST', jobData);
  }

  // อัพเดทงาน
  async updateJob(id: string, jobData: Partial<CronJob>): Promise<ApiResponse<CronJob>> {
    return this.fetchWithAuth<CronJob>(`/jobs/${id}`, 'PUT', jobData);
  }

  // ลบงาน
  async deleteJob(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth<void>(`/jobs/${id}`, 'DELETE');
  }

  // ---------- Job Logs ----------

  // ดึงข้อมูล logs ของงาน
  async getJobLogs(jobId: string): Promise<ApiResponse<JobLog[]>> {
    return this.fetchWithAuth<JobLog[]>(`/jobs/${jobId}/logs`);
  }

  // ---------- Users ----------

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.fetchWithAuth<User[]>('/users');
  }

  // ดึงข้อมูลผู้ใช้ตาม ID
  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.fetchWithAuth<User>(`/users/${id}`);
  }

  // อัพเดทผู้ใช้
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.fetchWithAuth<User>(`/users/${id}`, 'PUT', userData);
  }

  // ---------- Roles ----------
  
  // ดึงข้อมูล roles ทั้งหมด
  async getRoles(): Promise<ApiResponse<Role[]>> {
    return this.fetchWithAuth<Role[]>('/roles');
  }
  
  // ดึงข้อมูล role ตาม ID
  async getRole(id: string): Promise<ApiResponse<Role>> {
    return this.fetchWithAuth<Role>(`/roles/${id}`);
  }
  
  // สร้าง role ใหม่
  async createRole(roleData: { name: string, permissions: Permission[] }): Promise<ApiResponse<Role>> {
    return this.fetchWithAuth<Role>('/roles', 'POST', roleData);
  }
  
  // อัพเดท role
  async updateRole(id: string, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.fetchWithAuth<Role>(`/roles/${id}`, 'PUT', roleData);
  }
}

// สร้าง instance เดียวสำหรับการใช้งานทั้งแอพ
export const apiService = new ApiService();
