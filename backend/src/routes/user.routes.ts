
import { Elysia } from 'elysia';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

const userRepository = AppDataSource.getRepository(User);

export const userRoutes = new Elysia({ prefix: '/users' })
  // Get all users
  .get('/', async () => {
    try {
      const users = await userRepository.find({
        relations: ['role']
      });
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: `Failed to fetch users: ${error.message}` };
    }
  })

  // Get user by ID
  .get('/:id', async ({ params: { id } }) => {
    try {
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role']
      });
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: `Failed to fetch user: ${error.message}` };
    }
  })

  // Create new user
  .post('/', async ({ body }) => {
    try {
      // In a real app, you'd hash the password here
      const newUser = userRepository.create(body as Partial<User>);
      const result = await userRepository.save(newUser);
      return { success: true, data: result, message: 'User created successfully' };
    } catch (error) {
      return { success: false, error: `Failed to create user: ${error.message}` };
    }
  })

  // Update user
  .put('/:id', async ({ params: { id }, body }) => {
    try {
      const user = await userRepository.findOneBy({ id });
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      userRepository.merge(user, body as Partial<User>);
      const result = await userRepository.save(user);
      return { success: true, data: result, message: 'User updated successfully' };
    } catch (error) {
      return { success: false, error: `Failed to update user: ${error.message}` };
    }
  })

  // Delete user
  .delete('/:id', async ({ params: { id } }) => {
    try {
      const result = await userRepository.delete(id);
      
      if (result.affected === 0) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return { success: false, error: `Failed to delete user: ${error.message}` };
    }
  });
