import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) { }

    async createRoom() {
        const slug = uuidv4().split('-').slice(0, 3).join('-');
        return this.prisma.room.create({
            data: { slug },
        });
    }

    async findBySlug(slug: string) {
        return this.prisma.room.findUnique({
            where: { slug },
            include: { participants: true },
        });
    }

    async addParticipant(roomId: string, socketId: string, name?: string) {
        return this.prisma.participant.upsert({
            where: { socketId },
            update: { roomId, name },
            create: { roomId, socketId, name },
        });
    }

    async removeParticipantBySocketId(socketId: string) {
        try {
            return await this.prisma.participant.delete({
                where: { socketId },
            });
        } catch {
            return null;
        }
    }

    async getParticipants(roomId: string) {
        return this.prisma.participant.findMany({
            where: { roomId },
        });
    }

    async saveMessage(roomId: string, senderName: string, content: string) {
        return this.prisma.message.create({
            data: { roomId, senderName, content },
        });
    }

    async getMessagesBySlug(slug: string) {
        const room = await this.prisma.room.findUnique({ where: { slug } });
        if (!room) return [];
        return this.prisma.message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
        });
    }
}
