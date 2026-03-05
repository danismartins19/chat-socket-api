import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { MessagesService } from './messages.service';
import {
  ConversationResponse,
  ConversationWithLastMessageResponse,
  PaginatedMessagesResponse,
} from './dto/responses.dto';

@ApiTags('Mensagens e Conversas')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Criar nova conversa',
    description:
      'Cria uma nova conversa com os participantes especificados. O criador é automaticamente adicionado.',
  })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversa criada com sucesso',
    type: ConversationResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Um ou mais participantes não existem',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou ausente',
  })
  createConversation(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.userId, dto.participantIds);
  }

  @Get('conversations')
  @ApiOperation({
    summary: 'Listar conversas do usuário',
    description:
      'Retorna todas as conversas do usuário autenticado com a última mensagem de cada conversa',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de conversas retornada com sucesso',
    type: [ConversationWithLastMessageResponse],
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou ausente',
  })
  getUserConversations(@CurrentUserDecorator() user: CurrentUser) {
    return this.messagesService.getUserConversations(user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar mensagens de uma conversa',
    description: 'Retorna as mensagens de uma conversa específica com paginação',
  })
  @ApiQuery({
    name: 'conversationId',
    required: true,
    description: 'ID da conversa',
    example: 'clxyz789',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de itens por página (máximo 100)',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensagens retornada com sucesso',
    type: PaginatedMessagesResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou ausente',
  })
  listMessages(@Query() query: ListMessagesQueryDto) {
    return this.messagesService.listMessages(
      query.conversationId,
      query.page,
      query.limit,
    );
  }
}