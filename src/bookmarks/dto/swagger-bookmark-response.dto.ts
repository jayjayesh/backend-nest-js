import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SwaggerBookmarkResponseDto {
  @ApiProperty({ example: '7d6839fa-9a11-4bd9-9d3f-2b331ea9d46a' })
  id!: string;

  @ApiProperty({ example: '2026-06-30T06:57:21.851Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-30T06:57:21.851Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'new bookmark' })
  title!: string;

  @ApiPropertyOptional({ example: 'a description' })
  description?: string;

  @ApiProperty({ example: 'https://www.google.com' })
  link!: string;

  @ApiProperty({ example: '1f9a81a8-299c-456f-821a-cacec5651abc' })
  userId!: string;
}
