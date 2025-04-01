
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Project description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
