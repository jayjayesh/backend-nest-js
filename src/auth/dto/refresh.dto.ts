import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The refresh_token received at login',
    example: 'eyJhbG...BiSIw',
  })
  refresh_token!: string;
}
