import { PrismaService } from '../prisma/prisma.service.js';
export declare class RoomService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(): Promise<{
        id: string;
        slug: string;
        createdAt: Date;
    }>;
    findBySlug(slug: string): Promise<({
        participants: {
            id: string;
            name: string | null;
            socketId: string;
            roomId: string;
            joinedAt: Date;
        }[];
    } & {
        id: string;
        slug: string;
        createdAt: Date;
    }) | null>;
    addParticipant(roomId: string, socketId: string, name?: string): Promise<{
        id: string;
        name: string | null;
        socketId: string;
        roomId: string;
        joinedAt: Date;
    }>;
    removeParticipantBySocketId(socketId: string): Promise<{
        id: string;
        name: string | null;
        socketId: string;
        roomId: string;
        joinedAt: Date;
    } | null>;
    getParticipants(roomId: string): Promise<{
        id: string;
        name: string | null;
        socketId: string;
        roomId: string;
        joinedAt: Date;
    }[]>;
    saveMessage(roomId: string, senderName: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        roomId: string;
        senderName: string;
        content: string;
    }>;
    getMessagesBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        roomId: string;
        senderName: string;
        content: string;
    }[]>;
}
