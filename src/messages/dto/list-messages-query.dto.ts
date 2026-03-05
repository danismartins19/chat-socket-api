import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListMessagesQueryDto {
  @ApiProperty({
    description: 'ID da conversa',
    example: 'clxyz789',
  })
  @IsString()
  conversationId: string;

  @ApiProperty({
    description: 'Número da página',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => Number(value ?? 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}