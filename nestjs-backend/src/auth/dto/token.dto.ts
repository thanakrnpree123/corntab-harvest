
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'JWT token to validate' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
