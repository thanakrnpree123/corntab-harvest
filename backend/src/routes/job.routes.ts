
import { Elysia } from 'elysia';
import { JobController } from '../controllers/job.controller';

export const jobRoutes = new Elysia({ prefix: '/jobs' })
  // ดึงข้อมูลงานทั้งหมด
  .get('/', async () => {
    return await JobController.getAllJobs();
  })

  // ดึงข้อมูลงานตาม ID
  .get('/:id', async ({ params: { id } }) => {
    return await JobController.getJobById(id);
  })

  // ดึงข้อมูลงานตามโปรเจค
  .get('/project/:projectId', async ({ params: { projectId } }) => {
    return await JobController.getJobsByProject(projectId);
  })

  // สร้างงานใหม่
  .post('/', async ({ body }) => {
    return await JobController.createJob(body);
  })

  // อัพเดทงาน
  .put('/:id', async ({ params: { id }, body }) => {
    return await JobController.updateJob(id, body);
  })

  // ลบงาน
  .delete('/:id', async ({ params: { id } }) => {
    return await JobController.deleteJob(id);
  })
  
  // ทำสำเนางาน
  .post('/:id/duplicate', async ({ params: { id } }) => {
    return await JobController.duplicateJob(id);
  })

  // ดึงข้อมูล logs ของงาน
  .get('/:id/logs', async ({ params: { id } }) => {
    return await JobController.getJobLogs(id);
  })

  // สร้าง log ใหม่
  .post('/:id/logs', async ({ params: { id }, body }) => {
    const logData = { ...body, jobId: id };
    return await JobController.createJobLog(logData);
  });
