
import { Elysia } from "elysia";
import { authService } from "../services/auth.service";

// Middleware สำหรับการตรวจสอบการยืนยันตัวตน
export const authMiddleware = new Elysia()
  .derive(async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        isAuthenticated: false,
        user: null
      };
    }
    
    const token = authHeader.split(" ")[1];
    const user = await authService.validateToken(token);
    
    return {
      isAuthenticated: !!user,
      user
    };
  });

// Middleware สำหรับการป้องกันเส้นทางที่ต้องการการยืนยันตัวตน
export const requireAuth = new Elysia()
  .use(authMiddleware)
  .derive({ as: "global" }, async ({ isAuthenticated, set }) => {
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: "Unauthorized"
      };
    }
  });

// Middleware สำหรับการตรวจสอบสิทธิ์
export const checkPermission = (requiredPermission: string) => 
  new Elysia()
    .use(requireAuth)
    .derive({ as: "global" }, async ({ user, set }) => {
      // ถ้าไม่มีข้อมูลผู้ใช้ (ซึ่งไม่ควรเกิดขึ้นเนื่องจาก requireAuth แล้ว)
      if (!user || !user.role) {
        set.status = 401;
        return {
          success: false,
          error: "Unauthorized"
        };
      }
      
      // ตรวจสอบว่าผู้ใช้มีสิทธิ์ที่ต้องการหรือไม่
      const hasPermission = user.role.permissions.includes(requiredPermission as any);
      
      if (!hasPermission) {
        set.status = 403;
        return {
          success: false,
          error: "Forbidden: Insufficient permissions"
        };
      }
    });
