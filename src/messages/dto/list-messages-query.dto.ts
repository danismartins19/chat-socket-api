import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class ListMessagesQueryDto {
  @IsString()
  conversationId: string;

  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @Transform(({ value }) => Number(value ?? 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}