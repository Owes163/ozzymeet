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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const uuid_1 = require("uuid");
let RoomService = class RoomService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom() {
        const slug = (0, uuid_1.v4)().split('-').slice(0, 3).join('-');
        return this.prisma.room.create({
            data: { slug },
        });
    }
    async findBySlug(slug) {
        return this.prisma.room.findUnique({
            where: { slug },
            include: { participants: true },
        });
    }
    async addParticipant(roomId, socketId, name) {
        return this.prisma.participant.upsert({
            where: { socketId },
            update: { roomId, name },
            create: { roomId, socketId, name },
        });
    }
    async removeParticipantBySocketId(socketId) {
        try {
            return await this.prisma.participant.delete({
                where: { socketId },
            });
        }
        catch {
            return null;
        }
    }
    async getParticipants(roomId) {
        return this.prisma.participant.findMany({
            where: { roomId },
        });
    }
    async saveMessage(roomId, senderName, content) {
        return this.prisma.message.create({
            data: { roomId, senderName, content },
        });
    }
    async getMessagesBySlug(slug) {
        const room = await this.prisma.room.findUnique({ where: { slug } });
        if (!room)
            return [];
        return this.prisma.message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.RoomService = RoomService;
exports.RoomService = RoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], RoomService);
//# sourceMappingURL=room.service.js.map