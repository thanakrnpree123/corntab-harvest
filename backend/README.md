
# CornTab Backend API

Backend API สำหรับแอพพลิเคชั่น CornTab ที่ใช้เทคโนโลยี:
- MSSQL (Microsoft SQL Server)
- TypeORM
- Bun Runtime
- Elysia Framework

## การติดตั้ง

```bash
# ติดตั้ง dependencies
bun install
```

## การตั้งค่าฐานข้อมูล

1. ตั้งค่าตัวแปรสภาพแวดล้อม (หรือใช้ค่าเริ่มต้นสำหรับการพัฒนา):
   - `DB_HOST` - ที่อยู่เซิร์ฟเวอร์ฐานข้อมูล (ค่าเริ่มต้น: localhost)
   - `DB_PORT` - พอร์ตของฐานข้อมูล (ค่าเริ่มต้น: 1433)
   - `DB_USERNAME` - ชื่อผู้ใช้ฐานข้อมูล (ค่าเริ่มต้น: sa)
   - `DB_PASSWORD` - รหัสผ่านฐานข้อมูล (ค่าเริ่มต้น: YourStrong@Passw0rd)
   - `DB_NAME` - ชื่อฐานข้อมูล (ค่าเริ่มต้น: corntab)

2. MSSQL สามารถเริ่มต้นด้วย Docker:
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest
```

## การรัน

```bash
# โหมดพัฒนา (พร้อม hot-reload)
bun run dev

# โหมดผลิต
bun run start
```

## API Endpoints

### การยืนยันตัวตน
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/validate` - ตรวจสอบ token

### โปรเจค
- `GET /api/projects` - ดึงข้อมูลโปรเจคทั้งหมด
- `GET /api/projects/:id` - ดึงข้อมูลโปรเจคตาม ID
- `POST /api/projects` - สร้างโปรเจคใหม่
- `PUT /api/projects/:id` - อัพเดทโปรเจค
- `DELETE /api/projects/:id` - ลบโปรเจค

### งาน (Cron Jobs)
- `GET /api/jobs` - ดึงข้อมูลงานทั้งหมด
- `GET /api/jobs/:id` - ดึงข้อมูลงานตาม ID
- `GET /api/jobs/project/:projectId` - ดึงข้อมูลงานตามโปรเจค
- `POST /api/jobs` - สร้างงานใหม่
- `PUT /api/jobs/:id` - อัพเดทงาน
- `DELETE /api/jobs/:id` - ลบงาน
- `GET /api/jobs/:id/logs` - ดึงข้อมูล logs ของงาน
- `POST /api/jobs/:id/logs` - สร้าง log ใหม่

### ผู้ใช้
- `GET /api/users` - ดึงข้อมูลผู้ใช้ทั้งหมด
- `GET /api/users/:id` - ดึงข้อมูลผู้ใช้ตาม ID
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `PUT /api/users/:id` - อัพเดทผู้ใช้
- `DELETE /api/users/:id` - ลบผู้ใช้

### บทบาท
- `GET /api/roles` - ดึงข้อมูลบทบาททั้งหมด
- `GET /api/roles/:id` - ดึงข้อมูลบทบาทตาม ID
- `POST /api/roles` - สร้างบทบาทใหม่
- `PUT /api/roles/:id` - อัพเดทบทบาท
- `DELETE /api/roles/:id` - ลบบทบาท
