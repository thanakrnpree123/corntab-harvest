
import { Elysia } from 'elysia';
import { AppDataSource } from '../data-source';
import { Project } from '../entity/Project';

const projectRepository = AppDataSource.getRepository(Project);

export const projectRoutes = new Elysia({ prefix: '/projects' })
  // Get all projects
  .get('/', async () => {
    try {
      const projects = await projectRepository.find();
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: `Failed to fetch projects: ${error.message}` };
    }
  })

  // Get project by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const project = await projectRepository.findOne({
        where: { id },
        relations: ['jobs']
      });
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: `Failed to fetch project: ${error.message}` };
    }
  })

  // Create new project
  .post('/', async ({ body }) => {
    try {
      const newProject = projectRepository.create(body as Partial<Project>);
      const result = await projectRepository.save(newProject);
      return { success: true, data: result, message: 'Project created successfully' };
    } catch (error) {
      return { success: false, error: `Failed to create project: ${error.message}` };
    }
  })

  // Update project
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const project = await projectRepository.findOneBy({ id });
      
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      projectRepository.merge(project, body as Partial<Project>);
      const result = await projectRepository.save(project);
      return { success: true, data: result, message: 'Project updated successfully' };
    } catch (error) {
      return { success: false, error: `Failed to update project: ${error.message}` };
    }
  })

  // Delete project
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const result = await projectRepository.delete(id);
      
      if (result.affected === 0) {
        return { success: false, error: 'Project not found' };
      }
      
      return { success: true, message: 'Project deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete project: ${error.message}` };
    }
  });
