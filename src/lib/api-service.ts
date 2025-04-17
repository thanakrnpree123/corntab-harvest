
import { projectApi, jobApi, userApi, roleApi } from './api';
import { Project, CronJob, User, Role } from './types';

export const apiService = {
  // Project methods
  getProjects: () => projectApi.getAll(),
  getProject: (id: string) => projectApi.getById(id),
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => projectApi.create(project),
  updateProject: (id: string, project: Partial<Project>) => projectApi.update(id, project),
  deleteProject: (id: string) => projectApi.delete(id),

  // Job methods
  getJobs: () => jobApi.getAll(),
  getJobsByProject: (projectId: string) => jobApi.getAll(projectId),
  getJob: (id: string) => jobApi.getById(id),
  createJob: (job: Omit<CronJob, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastRun' | 'nextRun' | 'successCount' | 'failCount' | 'averageRuntime'>) => jobApi.create(job),
  updateJob: (id: string, job: Partial<CronJob>) => jobApi.update(id, job),
  duplicateJob: (id: string) => jobApi.duplicate(id),
  deleteJob: (id: string) => jobApi.delete(id),
  getJobLogs: (jobId: string) => jobApi.getLogs(jobId),
  triggerJob: (id: string) => jobApi.trigger(id), // Adding the missing triggerJob method

  // User methods
  getUsers: () => userApi.getAll(),
  getUser: (id: string) => userApi.getById(id),
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => userApi.create(user),
  updateUser: (id: string, user: Partial<User>) => userApi.update(id, user),
  deleteUser: (id: string) => userApi.delete(id),

  // Role methods
  getRoles: () => roleApi.getAll(),
  getRole: (id: string) => roleApi.getById(id),
  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => roleApi.create(role),
  updateRole: (id: string, role: Partial<Role>) => roleApi.update(id, role),
  deleteRole: (id: string) => roleApi.delete(id),
};
