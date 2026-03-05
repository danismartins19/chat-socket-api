import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID da conversa',
    example: 'clxyz789',
  })
  @IsString()
  conversationId: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, tudo bem?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;
}