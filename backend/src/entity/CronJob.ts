
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { Project } from "./Project";
import { JobLog } from "./JobLog";

export type JobStatus = 'idle' | 'running' | 'success' | 'failed' | 'paused';

@Entity()
export class CronJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  command: string;

  @Column()
  schedule: string;

  @Column({
    type: "varchar",
    enum: ["idle", "running", "success", "failed", "paused"],
    default: "idle"
  })
  status: JobStatus;

  @Column({ nullable: true, type: "datetime" })
  lastRun: Date | null;

  @Column({ nullable: true, type: "datetime" })
  nextRun: Date | null;

  @Column({ nullable: true })
  description: string;

  @Column("simple-array", { nullable: true })
  tags: string[];

  @Column({ default: 0 })
  failCount: number;

  @Column({ default: 0 })
  successCount: number;

  @Column({ nullable: true, type: "float" })
  averageRuntime: number;

  @Column({ default: "UTC" })
  timezone: string;

  @Column({ default: false })
  useLocalTime: boolean;

  @Column()
  projectId: string;

  @ManyToOne(() => Project, project => project.jobs)
  @JoinColumn({ name: "projectId" })
  project: Project;

  @OneToMany(() => JobLog, log => log.job)
  logs: JobLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
