
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { AppDataSource } from './data-source';
import { projectRoutes } from './routes/project.routes';
import { jobRoutes } from './routes/job.routes';
import { userRoutes } from './routes/user.routes';
import { roleRoutes } from './routes/role.routes';

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  });

// Create and configure Elysia app
const app = new Elysia()
  .use(cors())
  .get('/', () => ({ 
    message: 'CronTab API is running',
    version: '1.0.0' 
  }))
  .group('/api', (app) => 
    app
      .use(projectRoutes)
      .use(jobRoutes)
      .use(userRoutes)
      .use(roleRoutes)
  )
  .listen(3000);

console.log(`🚀 CronTab API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
