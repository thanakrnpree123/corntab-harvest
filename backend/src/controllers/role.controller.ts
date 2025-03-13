
import { AppDataSource } from "../data-source";
import { Role } from "../entity/Role";

const roleRepository = AppDataSource.getRepository(Role);

export const RoleController = {
  // ดึงข้อมูลบทบาททั้งหมด
  getAllRoles: async () => {
    try {
      const roles = await roleRepository.find();
      return { success: true, data: roles };
    } catch (error) {
      return { success: false, error: `Failed to fetch roles: ${error.message}` };
    }
  },

  // ดึงข้อมูลบทบาทตาม ID
  getRoleById: async (id: string) => {
    try {
      const role = await roleRepository.findOneBy({ id });

      if (!role) {
        return { success: false, error: "Role not found" };
      }

      return { success: true, data: role };
    } catch (error) {
      return { success: false, error: `Failed to fetch role: ${error.message}` };
    }
  },

  // สร้างบทบาทใหม่
  createRole: async (roleData: Partial<Role>) => {
    try {
      const newRole = roleRepository.create(roleData);
      const result = await roleRepository.save(newRole);
      return { success: true, data: result, message: "Role created successfully" };
    } catch (error) {
      return { success: false, error: `Failed to create role: ${error.message}` };
    }
  },

  // อัพเดทบทบาท
  updateRole: async (id: string, roleData: Partial<Role>) => {
    try {
      const role = await roleRepository.findOneBy({ id });

      if (!role) {
        return { success: false, error: "Role not found" };
      }

      roleRepository.merge(role, roleData);
      const result = await roleRepository.save(role);
      return { success: true, data: result, message: "Role updated successfully" };
    } catch (error) {
      return { success: false, error: `Failed to update role: ${error.message}` };
    }
  },

  // ลบบทบาท
  deleteRole: async (id: string) => {
    try {
      const result = await roleRepository.delete(id);

      if (result.affected === 0) {
        return { success: false, error: "Role not found" };
      }

      return { success: true, message: "Role deleted successfully" };
    } catch (error) {
      return { success: false, error: `Failed to delete role: ${error.message}` };
    }
  },
};
