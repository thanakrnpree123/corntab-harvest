
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

const userRepository = AppDataSource.getRepository(User);

export const UserController = {
  // ดึงข้อมูลผู้ใช้ทั้งหมด
  getAllUsers: async () => {
    try {
      const users = await userRepository.find({
        relations: ["role"],
      });
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: `Failed to fetch users: ${error.message}` };
    }
  },

  // ดึงข้อมูลผู้ใช้ตาม ID
  getUserById: async (id: string) => {
    try {
      const user = await userRepository.findOne({
        where: { id },
        relations: ["role"],
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: `Failed to fetch user: ${error.message}` };
    }
  },

  // สร้างผู้ใช้ใหม่
  createUser: async (userData: Partial<User>) => {
    try {
      const newUser = userRepository.create(userData);
      const result = await userRepository.save(newUser);
      return { success: true, data: result, message: "User created successfully" };
    } catch (error) {
      return { success: false, error: `Failed to create user: ${error.message}` };
    }
  },

  // อัพเดทผู้ใช้
  updateUser: async (id: string, userData: Partial<User>) => {
    try {
      const user = await userRepository.findOneBy({ id });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      userRepository.merge(user, userData);
      const result = await userRepository.save(user);
      return { success: true, data: result, message: "User updated successfully" };
    } catch (error) {
      return { success: false, error: `Failed to update user: ${error.message}` };
    }
  },

  // ลบผู้ใช้
  deleteUser: async (id: string) => {
    try {
      const result = await userRepository.delete(id);

      if (result.affected === 0) {
        return { success: false, error: "User not found" };
      }

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      return { success: false, error: `Failed to delete user: ${error.message}` };
    }
  },
};
