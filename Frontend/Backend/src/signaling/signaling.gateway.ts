import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service.js';

// In-memory map: socketId -> userName (fast lookups without DB hits)
const socketNameMap = new Map<string, string>();

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})
export class SignalingGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomService: RoomService) { }

    @SubscribeMessage('join-room')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string; userName?: string },
    ) {
        const room = await this.roomService.findBySlug(data.slug);
        if (!room) {
            client.emit('error', { message: 'Room not found' });
            return;
        }

        const name = data.userName || 'Anonymous';
        socketNameMap.set(client.id, name);

        // Add participant to DB
        await this.roomService.addParticipant(room.id, client.id, name);

        // Join the socket.io room
        client.join(data.slug);

        // Get all other participants — include their names
        const socketsInRoom = await this.server.in(data.slug).fetchSockets();
        const otherUsers = socketsInRoom
            .filter((s) => s.id !== client.id)
            .map((s) => ({
                socketId: s.id,
                userName: socketNameMap.get(s.id) || 'Anonymous',
            }));

        // Tell the new user about existing participants (with names)
        client.emit('all-users', otherUsers);

        // Notify others that a new user joined
        client.to(data.slug).emit('user-joined', {
            socketId: client.id,
            userName: name,
        });
    }

    @SubscribeMessage('offer')
    handleOffer(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { target: string; sdp: RTCSessionDescriptionInit },
    ) {
        this.server.to(data.target).emit('offer', {
            sdp: data.sdp,
            caller: client.id,
            callerName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }

    @SubscribeMessage('answer')
    handleAnswer(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { target: string; sdp: RTCSessionDescriptionInit },
    ) {
        this.server.to(data.target).emit('answer', {
            sdp: data.sdp,
            answerer: client.id,
            answererName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { target: string; candidate: RTCIceCandidateInit },
    ) {
        this.server.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            from: client.id,
        });
    }

    @SubscribeMessage('screen-share-started')
    handleScreenShareStarted(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string },
    ) {
        client.to(data.slug).emit('screen-share-started', {
            socketId: client.id,
            userName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }

    @SubscribeMessage('screen-share-stopped')
    handleScreenShareStopped(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string },
    ) {
        client.to(data.slug).emit('screen-share-stopped', {
            socketId: client.id,
        });
    }

    @SubscribeMessage('chat-message')
    async handleChatMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string; message: string },
    ) {
        const senderName = socketNameMap.get(client.id) || 'Anonymous';

        // Find the room to get roomId
        const room = await this.roomService.findBySlug(data.slug);
        if (!room) return;

        // Save to database
        const saved = await this.roomService.saveMessage(
            room.id,
            senderName,
            data.message,
        );

        // Broadcast to everyone in the room INCLUDING the sender
        this.server.in(data.slug).emit('chat-message', {
            id: saved.id,
            senderSocketId: client.id,
            senderName,
            message: data.message,
            timestamp: saved.createdAt.getTime(),
        });
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string },
    ) {
        client.to(data.slug).emit('typing', {
            socketId: client.id,
            userName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }

    @SubscribeMessage('stop-typing')
    handleStopTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { slug: string },
    ) {
        client.to(data.slug).emit('stop-typing', {
            socketId: client.id,
        });
    }

    async handleDisconnect(client: Socket) {
        socketNameMap.delete(client.id);

        // Remove participant from DB
        const participant = await this.roomService.removeParticipantBySocketId(
            client.id,
        );

        if (participant) {
            // Broadcast to all rooms the client was in
            const rooms = Array.from(client.rooms);
            rooms.forEach((roomSlug) => {
                if (roomSlug !== client.id) {
                    this.server.to(roomSlug).emit('user-left', {
                        socketId: client.id,
                    });
                }
            });
        }
    }
}
