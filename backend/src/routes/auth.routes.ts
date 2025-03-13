
import { Elysia } from 'elysia';
import { authService } from '../services/auth.service';

export const authRoutes = new Elysia({ prefix: '/auth' })
  // ลงทะเบียนผู้ใช้ใหม่
  .post('/register', async ({ body }) => {
    try {
      const { name, email, password } = body as any;
      const user = await authService.register(name, email, password);
      return { 
        success: true, 
        data: user,
        message: "Registration successful" 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || "Registration failed" 
      };
    }
  })

  // เข้าสู่ระบบ
  .post('/login', async ({ body }) => {
    try {
      const { email, password } = body as any;
      const result = await authService.login(email, password);
      return { 
        success: true, 
        data: result,
        message: "Login successful" 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || "Login failed" 
      };
    }
  })

  // ตรวจสอบการยืนยันตัวตน
  .post('/validate', async ({ body }) => {
    try {
      const { token } = body as any;
      const user = await authService.validateToken(token);
      
      if (!user) {
        return { 
          success: false, 
          error: "Invalid token" 
        };
      }
      
      return { 
        success: true, 
        data: { user, isValid: true },
        message: "Token is valid" 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || "Token validation failed" 
      };
    }
  });
