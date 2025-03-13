
import { Elysia } from 'elysia';
import { AppDataSource } from '../data-source';
import { CronJob } from '../entity/CronJob';
import { JobLog } from '../entity/JobLog';

const jobRepository = AppDataSource.getRepository(CronJob);
const logRepository = AppDataSource.getRepository(JobLog);

export const jobRoutes = new Elysia({ prefix: '/jobs' })
  // Get all jobs
  .get('/', async ({ query }) => {
    try {
      const projectId = query?.projectId;
      const where = projectId ? { projectId } : {};
      
      const jobs = await jobRepository.find({
        where,
        relations: ['project']
      });
      
      return { success: true, data: jobs };
    } catch (error) {
      return { success: false, error: `Failed to fetch jobs: ${error.message}` };
    }
  })

  // Get job by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const job = await jobRepository.findOne({
        where: { id },
        relations: ['project']
      });
      
      if (!job) {
        return { success: false, error: 'Job not found' };
      }
      
      return { success: true, data: job };
    } catch (error) {
      return { success: false, error: `Failed to fetch job: ${error.message}` };
    }
  })

  // Create new job
  .post('/', async ({ body }) => {
    try {
      const newJob = jobRepository.create(body as Partial<CronJob>);
      const result = await jobRepository.save(newJob);
      return { success: true, data: result, message: 'Job created successfully' };
    } catch (error) {
      return { success: false, error: `Failed to create job: ${error.message}` };
    }
  })

  // Update job
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const job = await jobRepository.findOneBy({ id });
      
      if (!job) {
        return { success: false, error: 'Job not found' };
      }
      
      jobRepository.merge(job, body as Partial<CronJob>);
      const result = await jobRepository.save(job);
      return { success: true, data: result, message: 'Job updated successfully' };
    } catch (error) {
      return { success: false, error: `Failed to update job: ${error.message}` };
    }
  })

  // Delete job
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const result = await jobRepository.delete(id);
      
      if (result.affected === 0) {
        return { success: false, error: 'Job not found' };
      }
      
      return { success: true, message: 'Job deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete job: ${error.message}` };
    }
  })

  // Get job logs
  .get('/:id/logs', async ({ params: { id } }) => {
    try {
      const logs = await logRepository.find({
        where: { jobId: id },
        order: { startTime: 'DESC' }
      });
      
      return { success: true, data: logs };
    } catch (error) {
      return { success: false, error: `Failed to fetch job logs: ${error.message}` };
    }
  });
