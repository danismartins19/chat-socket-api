import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({
    description: 'ID do usuário',
    example: 'clxyz123',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://exemplo.com/avatar.jpg',
  })
  avatar?: string | null;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2026-03-04T00:00:00.000Z',
  })
  createdAt: Date;
}

export class AuthResponse {
  @ApiProperty({
    description: 'Token JWT de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponse,
  })
  user: UserResponse;
}
