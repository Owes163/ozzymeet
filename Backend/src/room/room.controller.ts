import {
    Controller,
    Post,
    Get,
    Param,
    NotFoundException,
} from '@nestjs/common';
import { RoomService } from './room.service.js';

@Controller('rooms')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post()
    async createRoom() {
        const room = await this.roomService.createRoom();
        return { roomId: room.id, slug: room.slug };
    }

    @Get(':slug')
    async getRoom(@Param('slug') slug: string) {
        const room = await this.roomService.findBySlug(slug);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return {
            roomId: room.id,
            slug: room.slug,
            participantCount: room.participants.length,
        };
    }

    @Get(':slug/messages')
    async getMessages(@Param('slug') slug: string) {
        const messages = await this.roomService.getMessagesBySlug(slug);
        return messages.map((m) => ({
            id: m.id,
            senderName: m.senderName,
            message: m.content,
            timestamp: m.createdAt.getTime(),
        }));
    }
}
