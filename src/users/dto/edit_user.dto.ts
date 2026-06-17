import { IsEmail, IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
