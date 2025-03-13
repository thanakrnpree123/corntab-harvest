
import { Elysia } from 'elysia';
import { UserController } from '../controllers/user.controller';

export const userRoutes = new Elysia({ prefix: '/users' })
  // ดึงข้อมูลผู้ใช้ทั้งหมด
  .get('/', async () => {
    return await UserController.getAllUsers();
  })

  // ดึงข้อมูลผู้ใช้ตาม ID
  .get('/:id', async ({ params: { id } }) => {
    return await UserController.getUserById(id);
  })

  // สร้างผู้ใช้ใหม่
  .post('/', async ({ body }) => {
    return await UserController.createUser(body);
  })

  // อัพเดทผู้ใช้
  .put('/:id', async ({ params: { id }, body }) => {
    return await UserController.updateUser(id, body);
  })

  // ลบผู้ใช้
  .delete('/:id', async ({ params: { id } }) => {
    return await UserController.deleteUser(id);
  });
