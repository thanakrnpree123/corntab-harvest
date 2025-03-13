
import { Elysia } from 'elysia';
import { ProjectController } from '../controllers/project.controller';

export const projectRoutes = new Elysia({ prefix: '/projects' })
  // ดึงข้อมูลโปรเจคทั้งหมด
  .get('/', async () => {
    return await ProjectController.getAllProjects();
  })

  // ดึงข้อมูลโปรเจคตาม ID
  .get('/:id', async ({ params: { id } }) => {
    return await ProjectController.getProjectById(id);
  })

  // สร้างโปรเจคใหม่
  .post('/', async ({ body }) => {
    return await ProjectController.createProject(body);
  })

  // อัพเดทโปรเจค
  .put('/:id', async ({ params: { id }, body }) => {
    return await ProjectController.updateProject(id, body);
  })

  // ลบโปรเจค
  .delete('/:id', async ({ params: { id } }) => {
    return await ProjectController.deleteProject(id);
  });
