
import { Elysia } from 'elysia';
import { RoleController } from '../controllers/role.controller';

export const roleRoutes = new Elysia({ prefix: '/roles' })
  // ดึงข้อมูลบทบาททั้งหมด
  .get('/', async () => {
    return await RoleController.getAllRoles();
  })

  // ดึงข้อมูลบทบาทตาม ID
  .get('/:id', async ({ params: { id } }) => {
    return await RoleController.getRoleById(id);
  })

  // สร้างบทบาทใหม่
  .post('/', async ({ body }) => {
    return await RoleController.createRole(body);
  })

  // อัพเดทบทบาท
  .put('/:id', async ({ params: { id }, body }) => {
    return await RoleController.updateRole(id, body);
  })

  // ลบบทบาท
  .delete('/:id', async ({ params: { id } }) => {
    return await RoleController.deleteRole(id);
  });
