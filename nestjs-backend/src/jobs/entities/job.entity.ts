
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { JobLogEntity } from '../../logs/entities/job-log.entity';

export enum JobStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  PAUSED = 'paused',
}

@Entity('jobs')
export class JobEntity extends BaseEntity {
  @ApiProperty({ description: 'Job name' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Command to execute' })
  @Column({ length: 500 })
  command: string;

  @ApiProperty({ description: 'Cron schedule expression' })
  @Column({ length: 100 })
  schedule: string;

  @ApiProperty({ description: 'Job description' })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ enum: JobStatus, default: JobStatus.IDLE })
  @Column({
    type: 'varchar',
    length: 10,
    enum: JobStatus,
    default: JobStatus.IDLE,
  })
  status: JobStatus;

  @ApiProperty({ description: 'Last execution time', nullable: true })
  @Column({ name: 'last_run', nullable: true, type: 'datetime' })
  lastRun: Date;

  @ApiProperty({ description: 'Next scheduled execution time', nullable: true })
  @Column({ name: 'next_run', nullable: true, type: 'datetime' })
  nextRun: Date;

  @ApiProperty({ description: 'Tags for categorizing jobs' })
  @Column({ length: 255, nullable: true })
  tags: string;

  @ApiProperty({ description: 'Number of failed executions' })
  @Column({ name: 'fail_count', default: 0 })
  failCount: number;

  @ApiProperty({ description: 'Number of successful executions' })
  @Column({ name: 'success_count', default: 0 })
  successCount: number;

  @ApiProperty({ description: 'Project ID' })
  @Column({ name: 'project_id' })
  projectId: string;

  @ApiProperty({ description: 'Timezone for the job', default: 'UTC' })
  @Column({ length: 50, default: 'UTC' })
  timezone: string;

  @ApiProperty({
    description: 'Whether to use local time or UTC',
    default: false,
  })
  @Column({ name: 'use_local_time', default: false })
  useLocalTime: boolean;

  @ApiProperty({ description: 'Average runtime in seconds' })
  @Column({ name: 'average_runtime', type: 'float', nullable: true })
  averageRuntime: number;

  @ManyToOne(() => ProjectEntity, (project) => project.jobs)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @OneToMany(() => JobLogEntity, (log) => log.job)
  logs: JobLogEntity[];
}
