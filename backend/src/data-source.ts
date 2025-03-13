
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Project } from "./entity/Project";
import { CronJob } from "./entity/CronJob";
import { JobLog } from "./entity/JobLog";
import { User } from "./entity/User";
import { Role } from "./entity/Role";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "1433"),
  username: process.env.DB_USERNAME || "sa",
  password: process.env.DB_PASSWORD || "YourStrong@Passw0rd",
  database: process.env.DB_NAME || "corntab",
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === "development",
  entities: [Project, CronJob, JobLog, User, Role],
  migrations: [],
  subscribers: [],
  options: {
    encrypt: true, // Use this if you're on Azure
    trustServerCertificate: true, // Only for development
  },
});
