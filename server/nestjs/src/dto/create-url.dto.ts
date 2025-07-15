import { IsUrl, IsNotEmpty, IsString } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty({ message: 'URL is required' })
  @IsString({ message: 'URL must be a string' })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;
}
