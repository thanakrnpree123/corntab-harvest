
import { DataSourceOptions } from "typeorm";

// กำหนดค่า TypeORM สำหรับการเชื่อมต่อฐานข้อมูล
export const ormconfig: DataSourceOptions = {
  type: "mssql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  username: process.env.DB_USERNAME || "sa",
  password: process.env.DB_PASSWORD || "YourStrong@Passw0rd",
  database: process.env.DB_NAME || "corntab",
  synchronize: true, // ตั้งค่าเป็น false ในการใช้งานจริง
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  options: {
    encrypt: true, // ใช้ในกรณีที่เป็น Azure
    trustServerCertificate: true, // สำหรับการพัฒนาเท่านั้น
  },
};
