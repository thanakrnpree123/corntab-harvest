
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { JobEntity } from '../../jobs/entities/job.entity';

@Entity('projects')
export class ProjectEntity extends BaseEntity {
  @ApiProperty({ description: 'Project name' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Project description' })
  @Column({ length: 500, nullable: true })
  description: string;

  @ApiProperty({ description: 'Related jobs', type: () => [JobEntity] })
  @OneToMany(() => JobEntity, (job) => job.project)
  jobs: JobEntity[];
}
