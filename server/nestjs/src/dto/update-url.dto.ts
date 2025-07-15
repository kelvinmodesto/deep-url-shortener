import { IsUrl, IsOptional, IsString } from 'class-validator';

export class UpdateUrlDto {
  @IsOptional()
  @IsString({ message: 'URL must be a string' })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url?: string;
}
