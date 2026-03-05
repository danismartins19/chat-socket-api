import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserInMessageResponse {
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
}

export class MessageResponse {
  @ApiProperty({
    description: 'ID da mensagem',
    example: 'clxyz456',
  })
  id: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, tudo bem?',
  })
  content: string;

  @ApiProperty({
    description: 'Data de criação da mensagem',
    example: '2026-03-04T12:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Dados do remetente',
    type: UserInMessageResponse,
  })
  sender: UserInMessageResponse;
}

export class MessageWithConversationResponse extends MessageResponse {
  @ApiProperty({
    description: 'Dados da conversa',
    example: { id: 'clxyz789' },
  })
  conversation: {
    id: string;
  };
}

export class PaginationMeta {
  @ApiProperty({
    description: 'Número da página atual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de itens',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 8,
  })
  totalPages: number;
}

export class PaginatedMessagesResponse {
  @ApiProperty({
    description: 'Lista de mensagens',
    type: [MessageResponse],
  })
  items: MessageResponse[];

  @ApiProperty({
    description: 'Metadados de paginação',
    type: PaginationMeta,
  })
  pagination: PaginationMeta;
}

export class UserConversationParticipant {
  @ApiProperty({
    description: 'ID da participação',
    example: 'clxyz999',
  })
  id: string;

  @ApiProperty({
    description: 'Dados do usuário participante',
    type: UserInMessageResponse,
  })
  user: UserInMessageResponse;
}

export class ConversationResponse {
  @ApiProperty({
    description: 'ID da conversa',
    example: 'clxyz789',
  })
  id: string;

  @ApiProperty({
    description: 'Data de criação da conversa',
    example: '2026-03-04T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Lista de participantes',
    type: [UserConversationParticipant],
  })
  participants: UserConversationParticipant[];
}

export class ConversationWithLastMessageResponse extends ConversationResponse {
  @ApiProperty({
    description: 'Última mensagem da conversa',
    type: [MessageResponse],
    example: [],
  })
  messages: MessageResponse[];
}
