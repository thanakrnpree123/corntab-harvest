
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { AppDataSource } from './data-source';
import { projectRoutes } from './routes/project.routes';
import { jobRoutes } from './routes/job.routes';
import { userRoutes } from './routes/user.routes';
import { roleRoutes } from './routes/role.routes';
import { authRoutes } from './routes/auth.routes';
import { schedulerService } from './services/scheduler.service';

// เริ่มต้นการเชื่อมต่อฐานข้อมูล
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    // เริ่มต้น scheduler service หลังจากเชื่อมต่อฐานข้อมูลสำเร็จ
    schedulerService.initialize()
      .then(() => console.log("Scheduler service initialized"))
      .catch(err => console.error("Failed to initialize scheduler:", err));
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  });

// สร้างและกำหนดค่า Elysia app
const app = new Elysia()
  .use(cors())
  .get('/', () => ({ 
    message: 'CronTab API is running',
    version: '1.0.0' 
  }))
  .group('/api', (app) => 
    app
      .use(authRoutes)
      .use(projectRoutes)
      .use(jobRoutes)
      .use(userRoutes)
      .use(roleRoutes)
  )
  .listen(3000);

console.log(`🚀 CronTab API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
