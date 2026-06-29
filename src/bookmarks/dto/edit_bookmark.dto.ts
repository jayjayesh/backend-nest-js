import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditBookmarkDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'new bookmark edit' })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'new bookmark description edit' })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'https://www.docs.google.com',
    description: 'it should start with http',
  })
  link?: string;
}
