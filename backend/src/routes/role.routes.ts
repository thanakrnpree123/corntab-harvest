
import { Elysia } from 'elysia';
import { AppDataSource } from '../data-source';
import { Role } from '../entity/Role';

const roleRepository = AppDataSource.getRepository(Role);

export const roleRoutes = new Elysia({ prefix: '/roles' })
  // Get all roles
  .get('/', async () => {
    try {
      const roles = await roleRepository.find();
      return { success: true, data: roles };
    } catch (error) {
      return { success: false, error: `Failed to fetch roles: ${error.message}` };
    }
  })

  // Get role by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const role = await roleRepository.findOneBy({ id });
      
      if (!role) {
        return { success: false, error: 'Role not found' };
      }
      
      return { success: true, data: role };
    } catch (error) {
      return { success: false, error: `Failed to fetch role: ${error.message}` };
    }
  })

  // Create new role
  .post('/', async ({ body }) => {
    try {
      const newRole = roleRepository.create(body as Partial<Role>);
      const result = await roleRepository.save(newRole);
      return { success: true, data: result, message: 'Role created successfully' };
    } catch (error) {
      return { success: false, error: `Failed to create role: ${error.message}` };
    }
  })

  // Update role
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const role = await roleRepository.findOneBy({ id });
      
      if (!role) {
        return { success: false, error: 'Role not found' };
      }
      
      roleRepository.merge(role, body as Partial<Role>);
      const result = await roleRepository.save(role);
      return { success: true, data: result, message: 'Role updated successfully' };
    } catch (error) {
      return { success: false, error: `Failed to update role: ${error.message}` };
    }
  })

  // Delete role
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const result = await roleRepository.delete(id);
      
      if (result.affected === 0) {
        return { success: false, error: 'Role not found' };
      }
      
      return { success: true, message: 'Role deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete role: ${error.message}` };
    }
  });
