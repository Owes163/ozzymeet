"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const room_service_js_1 = require("../room/room.service.js");
const socketNameMap = new Map();
let SignalingGateway = class SignalingGateway {
    roomService;
    server;
    constructor(roomService) {
        this.roomService = roomService;
    }
    async handleJoinRoom(client, data) {
        const room = await this.roomService.findBySlug(data.slug);
        if (!room) {
            client.emit('error', { message: 'Room not found' });
            return;
        }
        const name = data.userName || 'Anonymous';
        socketNameMap.set(client.id, name);
        await this.roomService.addParticipant(room.id, client.id, name);
        client.join(data.slug);
        const socketsInRoom = await this.server.in(data.slug).fetchSockets();
        const otherUsers = socketsInRoom
            .filter((s) => s.id !== client.id)
            .map((s) => ({
            socketId: s.id,
            userName: socketNameMap.get(s.id) || 'Anonymous',
        }));
        client.emit('all-users', otherUsers);
        client.to(data.slug).emit('user-joined', {
            socketId: client.id,
            userName: name,
        });
    }
    handleOffer(client, data) {
        this.server.to(data.target).emit('offer', {
            sdp: data.sdp,
            caller: client.id,
            callerName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }
    handleAnswer(client, data) {
        this.server.to(data.target).emit('answer', {
            sdp: data.sdp,
            answerer: client.id,
            answererName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }
    handleIceCandidate(client, data) {
        this.server.to(data.target).emit('ice-candidate', {
            candidate: data.candidate,
            from: client.id,
        });
    }
    handleScreenShareStarted(client, data) {
        client.to(data.slug).emit('screen-share-started', {
            socketId: client.id,
            userName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }
    handleScreenShareStopped(client, data) {
        client.to(data.slug).emit('screen-share-stopped', {
            socketId: client.id,
        });
    }
    async handleChatMessage(client, data) {
        const senderName = socketNameMap.get(client.id) || 'Anonymous';
        const room = await this.roomService.findBySlug(data.slug);
        if (!room)
            return;
        const saved = await this.roomService.saveMessage(room.id, senderName, data.message);
        this.server.in(data.slug).emit('chat-message', {
            id: saved.id,
            senderSocketId: client.id,
            senderName,
            message: data.message,
            timestamp: saved.createdAt.getTime(),
        });
    }
    handleTyping(client, data) {
        client.to(data.slug).emit('typing', {
            socketId: client.id,
            userName: socketNameMap.get(client.id) || 'Anonymous',
        });
    }
    handleStopTyping(client, data) {
        client.to(data.slug).emit('stop-typing', {
            socketId: client.id,
        });
    }
    async handleDisconnect(client) {
        socketNameMap.delete(client.id);
        const participant = await this.roomService.removeParticipantBySocketId(client.id);
        if (participant) {
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
};
exports.SignalingGateway = SignalingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SignalingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ice-candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen-share-started'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleScreenShareStarted", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('screen-share-stopped'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleScreenShareStopped", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat-message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], SignalingGateway.prototype, "handleChatMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stop-typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], SignalingGateway.prototype, "handleStopTyping", null);
exports.SignalingGateway = SignalingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    }),
    __metadata("design:paramtypes", [room_service_js_1.RoomService])
], SignalingGateway);
//# sourceMappingURL=signaling.gateway.js.map