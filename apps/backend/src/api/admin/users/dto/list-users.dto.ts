import { PaginationDto } from '@org/backend-base';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
