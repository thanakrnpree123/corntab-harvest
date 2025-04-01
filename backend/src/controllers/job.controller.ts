
import { AppDataSource } from "../data-source";
import { CronJob } from "../entity/CronJob";
import { JobLog } from "../entity/JobLog";

const jobRepository = AppDataSource.getRepository(CronJob);
const logRepository = AppDataSource.getRepository(JobLog);

export const JobController = {
  // ดึงข้อมูลงานทั้งหมด
  getAllJobs: async () => {
    try {
      const jobs = await jobRepository.find({
        relations: ["project"],
      });
      return { success: true, data: jobs };
    } catch (error) {
      return { success: false, error: `Failed to fetch jobs: ${error.message}` };
    }
  },

  // ดึงข้อมูลงานตาม ID
  getJobById: async (id: string) => {
    try {
      const job = await jobRepository.findOne({
        where: { id },
        relations: ["project", "logs"],
      });

      if (!job) {
        return { success: false, error: "Job not found" };
      }

      return { success: true, data: job };
    } catch (error) {
      return { success: false, error: `Failed to fetch job: ${error.message}` };
    }
  },

  // ดึงข้อมูลงานตามโปรเจค
  getJobsByProject: async (projectId: string) => {
    try {
      const jobs = await jobRepository.find({
        where: { projectId },
        relations: ["logs"],
      });
      return { success: true, data: jobs };
    } catch (error) {
      return { success: false, error: `Failed to fetch jobs: ${error.message}` };
    }
  },

  // สร้างงานใหม่
  createJob: async (jobData: Partial<CronJob>) => {
    try {
      // Ensure the job has an endpoint
      if (!jobData.endpoint) {
        return { success: false, error: "Endpoint URL is required" };
      }

      const newJob = jobRepository.create(jobData);
      
      // Set defaults
      if (!newJob.status) {
        newJob.status = "idle";
      }
      
      if (!newJob.httpMethod) {
        newJob.httpMethod = "GET";
      }

      const result = await jobRepository.save(newJob);
      return { success: true, data: result, message: "Job created successfully" };
    } catch (error) {
      return { success: false, error: `Failed to create job: ${error.message}` };
    }
  },

  // อัพเดทงาน
  updateJob: async (id: string, jobData: Partial<CronJob>) => {
    try {
      const job = await jobRepository.findOneBy({ id });

      if (!job) {
        return { success: false, error: "Job not found" };
      }

      jobRepository.merge(job, jobData);
      const result = await jobRepository.save(job);
      return { success: true, data: result, message: "Job updated successfully" };
    } catch (error) {
      return { success: false, error: `Failed to update job: ${error.message}` };
    }
  },

  // ลบงาน
  deleteJob: async (id: string) => {
    try {
      const result = await jobRepository.delete(id);

      if (result.affected === 0) {
        return { success: false, error: "Job not found" };
      }

      return { success: true, message: "Job deleted successfully" };
    } catch (error) {
      return { success: false, error: `Failed to delete job: ${error.message}` };
    }
  },

  // ดึงข้อมูล logs ของงาน
  getJobLogs: async (jobId: string) => {
    try {
      const logs = await logRepository.find({
        where: { jobId },
        order: { startTime: "DESC" },
      });
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: `Failed to fetch job logs: ${error.message}` };
    }
  },

  // สร้าง log ใหม่
  createJobLog: async (logData: Partial<JobLog>) => {
    try {
      const newLog = logRepository.create(logData);
      const result = await logRepository.save(newLog);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: `Failed to create job log: ${error.message}` };
    }
  },
};
