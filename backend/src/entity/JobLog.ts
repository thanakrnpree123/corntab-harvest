
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { CronJob } from "./CronJob";
import { JobStatus } from "./CronJob";

@Entity()
export class JobLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  jobId: string;

  @ManyToOne(() => CronJob, job => job.logs)
  @JoinColumn({ name: "jobId" })
  job: CronJob;

  @Column({
    type: "varchar",
    enum: ["idle", "running", "success", "failed", "paused"]
  })
  status: JobStatus;

  @Column({ type: "datetime" })
  startTime: Date;

  @Column({ type: "datetime", nullable: true })
  endTime: Date | null;

  @Column({ type: "float", nullable: true })
  duration: number | null;

  @Column({ type: "text" })
  output: string;

  @Column({ type: "text", nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
