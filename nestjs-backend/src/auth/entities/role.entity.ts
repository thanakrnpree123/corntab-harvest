
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @ApiProperty({ description: 'Role name' })
  @Column({ length: 50, unique: true })
  name: string;

  @ApiProperty({ description: 'Role permissions' })
  @Column({ type: 'simple-json' })
  permissions: string[];

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
