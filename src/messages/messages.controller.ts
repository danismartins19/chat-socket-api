import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import type { CurrentUser } from '../auth/interfaces/current-user.interface';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  createConversation(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.messagesService.createConversation(user.userId, dto.participantIds);
  }

  @Get('conversations')
  getUserConversations(@CurrentUserDecorator() user: CurrentUser) {
    return this.messagesService.getUserConversations(user.userId);
  }

  @Get()
  listMessages(@Query() query: ListMessagesQueryDto) {
    return this.messagesService.listMessages(
      query.conversationId,
      query.page,
      query.limit,
    );
  }
}