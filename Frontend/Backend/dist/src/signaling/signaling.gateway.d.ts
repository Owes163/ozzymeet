import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service.js';
export declare class SignalingGateway implements OnGatewayDisconnect {
    private readonly roomService;
    server: Server;
    constructor(roomService: RoomService);
    handleJoinRoom(client: Socket, data: {
        slug: string;
        userName?: string;
    }): Promise<void>;
    handleOffer(client: Socket, data: {
        target: string;
        sdp: RTCSessionDescriptionInit;
    }): void;
    handleAnswer(client: Socket, data: {
        target: string;
        sdp: RTCSessionDescriptionInit;
    }): void;
    handleIceCandidate(client: Socket, data: {
        target: string;
        candidate: RTCIceCandidateInit;
    }): void;
    handleScreenShareStarted(client: Socket, data: {
        slug: string;
    }): void;
    handleScreenShareStopped(client: Socket, data: {
        slug: string;
    }): void;
    handleChatMessage(client: Socket, data: {
        slug: string;
        message: string;
    }): Promise<void>;
    handleTyping(client: Socket, data: {
        slug: string;
    }): void;
    handleStopTyping(client: Socket, data: {
        slug: string;
    }): void;
    handleDisconnect(client: Socket): Promise<void>;
}
