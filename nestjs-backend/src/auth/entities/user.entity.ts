
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/entities/base.entity';
import { RoleEntity } from './role.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity extends BaseEntity {
  @ApiProperty({ description: 'User name' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'User email' })
  @Column({ length: 100, unique: true })
  email: string;

  @ApiHideProperty()
  @Column({ length: 100 })
  @Exclude()
  password: string;

  @ApiProperty({ description: 'User avatar URL', nullable: true })
  @Column({ length: 255, nullable: true })
  avatar: string;

  @ApiProperty({ description: 'Role ID' })
  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
