
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import * as crypto from "crypto";

class AuthService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  // สร้างฟังก์ชันสำหรับการลงทะเบียนผู้ใช้ใหม่
  async register(name: string, email: string, password: string): Promise<User | null> {
    // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    // สร้างรหัสผ่านที่เข้ารหัสแล้ว
    const hashedPassword = this.hashPassword(password);

    // หาบทบาทเริ่มต้น (user)
    let userRole = await this.roleRepository.findOne({ where: { name: "user" } });
    
    // ถ้าไม่มีบทบาทผู้ใช้ ให้สร้างใหม่
    if (!userRole) {
      userRole = new Role();
      userRole.name = "user";
      userRole.permissions = ["view"];
      await this.roleRepository.save(userRole);
    }

    // สร้างผู้ใช้ใหม่
    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.roleId = userRole.id;

    // บันทึกลงฐานข้อมูล
    return this.userRepository.save(newUser);
  }

  // สร้างฟังก์ชันสำหรับการเข้าสู่ระบบ
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    // ค้นหาผู้ใช้จากอีเมล
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ["id", "email", "password", "name", "roleId", "avatar", "createdAt", "updatedAt"],
      relations: ["role"]
    });
    
    // ถ้าไม่พบผู้ใช้
    if (!user) {
      throw new Error("User not found");
    }
    
    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    
    // สร้าง token แบบง่าย (ในการใช้งานจริงควรใช้ JWT)
    const token = this.generateToken(user);
    
    // ซ่อนรหัสผ่านก่อนส่งคืน
    const { password: _, ...userWithoutPassword } = user;
    
    return { 
      user: userWithoutPassword as User, 
      token 
    };
  }

  // เข้ารหัสรหัสผ่าน
  private hashPassword(password: string): string {
    // ในตัวอย่างนี้ใช้ SHA-256 แบบง่าย
    // ในการใช้งานจริงควรใช้ bcrypt หรือ argon2
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // ตรวจสอบรหัสผ่าน
  private verifyPassword(password: string, hashedPassword: string): boolean {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hashedPassword;
  }

  // สร้าง token แบบง่าย
  private generateToken(user: User): string {
    // ในตัวอย่างนี้สร้าง token แบบง่าย
    // ในการใช้งานจริงควรใช้ JWT และมีการกำหนดเวลาหมดอายุ
    const payload = {
      id: user.id,
      email: user.email,
      role: user.roleId
    };
    
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // ตรวจสอบ token
  async validateToken(token: string): Promise<User | null> {
    try {
      // ถอดรหัส token
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!payload.id || !payload.email) {
        return null;
      }
      
      // ค้นหาผู้ใช้จาก ID
      const user = await this.userRepository.findOne({
        where: { id: payload.id, email: payload.email },
        relations: ["role"]
      });
      
      return user;
    } catch (error) {
      return null;
    }
  }
}

// สร้าง Singleton instance
export const authService = new AuthService();
