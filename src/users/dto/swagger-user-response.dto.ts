import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SwaggerUserResponseDto {
  @ApiProperty({ example: '1f9a81a8-299c-456f-821a-cacec5651abc' })
  id!: string;
  @ApiProperty({ example: '2026-06-30T06:57:21.851Z' })
  createdAt!: Date;
  @ApiProperty({ example: '2026-06-30T06:57:21.851Z' })
  updatedAt!: Date;
  @ApiProperty({ example: 'test@gmail.com' })
  email!: string;
  // @ApiProperty({ example: 'password' })
  // password!: String;
  @ApiPropertyOptional({ example: 'first name' })
  firstName?: string;
  @ApiPropertyOptional({ example: 'last name' })
  lastName?: string;
}
