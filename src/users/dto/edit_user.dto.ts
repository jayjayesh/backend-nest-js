import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsEmail()
  @IsString()
  @ApiPropertyOptional({
    example: 'test@gmail.com',
    description: 'it should be unique, duplicate entry not allowed',
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'YourFirstName', default: '' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'YourLastName' })
  lastName?: string;
}
