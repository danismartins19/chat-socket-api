import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';

interface JwtPayload {
  sub: string;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
      });

      client.data.user = {
        userId: payload.sub,
        email: payload.email,
      } as CurrentUser;

      // Conecta usuário em todas as suas conversas
      const conversations =
        await this.messagesService.getUserConversations(payload.sub);
      for (const conv of conversations) {
        await client.join(`conversation:${conv.id}`);
      }
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    // Socket.IO limpa as rooms automaticamente
  }

  @SubscribeMessage('conversations:join')
  @UseGuards(WsJwtGuard)
  async joinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    const user = client.data.user as CurrentUser;

    // Verifica se o usuário é participante da conversa
    const participants =
      await this.messagesService.getConversationParticipants(conversationId);

    if (participants.includes(user.userId)) {
      await client.join(`conversation:${conversationId}`);
      return { success: true, conversationId };
    }

    return { success: false, error: 'Não autorizado' };
  }

  @SubscribeMessage('messages:send')
  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const user = client.data.user as CurrentUser;
    const message = await this.messagesService.createMessage(
      user.userId,
      dto.conversationId,
      dto.content,
    );

    // Broadcast apenas para os participantes da conversa
    this.server
      .to(`conversation:${dto.conversationId}`)
      .emit('messages:new', message);

    return message;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const authorization = client.handshake.headers.authorization;
    if (
      typeof authorization === 'string' &&
      authorization.startsWith('Bearer ')
    ) {
      return authorization.slice(7);
    }

    return null;
  }
}