import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookmarkDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'new bookmark' })
  title!: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'new bookmark description' })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'https://www.google.com',
    description: 'it should start with http',
  })
  link!: string;
}
