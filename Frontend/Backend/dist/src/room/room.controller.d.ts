import { RoomService } from './room.service.js';
export declare class RoomController {
    private readonly roomService;
    constructor(roomService: RoomService);
    createRoom(): Promise<{
        roomId: string;
        slug: string;
    }>;
    getRoom(slug: string): Promise<{
        roomId: string;
        slug: string;
        participantCount: number;
    }>;
    getMessages(slug: string): Promise<{
        id: string;
        senderName: string;
        message: string;
        timestamp: number;
    }[]>;
}
