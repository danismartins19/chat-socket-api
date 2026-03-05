import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(creatorId: string, participantIds: string[]) {
    const uniqueParticipantIds = [...new Set([creatorId, ...participantIds])];

    // Verifica se os participantes existem
    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueParticipantIds } },
      select: { id: true },
    });

    if (users.length !== uniqueParticipantIds.length) {
      throw new BadRequestException('Um ou mais participantes não existem');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        participants: {
          create: uniqueParticipantIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return conversations;
  }

  async createMessage(
    senderId: string,
    conversationId: string,
    content: string,
  ) {
    // Verifica se o usuário participa da conversa
    const participation = await this.prisma.userConversation.findFirst({
      where: {
        userId: senderId,
        conversationId,
      },
    });

    if (!participation) {
      throw new BadRequestException(
        'Você não é participante desta conversa',
      );
    }

    return this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async listMessages(conversationId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [total, items] = await this.prisma.$transaction([
      this.prisma.message.count({
        where: { conversationId },
      }),
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getConversationParticipants(conversationId: string) {
    const participants = await this.prisma.userConversation.findMany({
      where: { conversationId },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    return participants.map((p) => p.user.id);
  }
}