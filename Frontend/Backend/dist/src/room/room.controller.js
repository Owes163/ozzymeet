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
exports.RoomController = void 0;
const common_1 = require("@nestjs/common");
const room_service_js_1 = require("./room.service.js");
let RoomController = class RoomController {
    roomService;
    constructor(roomService) {
        this.roomService = roomService;
    }
    async createRoom() {
        const room = await this.roomService.createRoom();
        return { roomId: room.id, slug: room.slug };
    }
    async getRoom(slug) {
        const room = await this.roomService.findBySlug(slug);
        if (!room) {
            throw new common_1.NotFoundException('Room not found');
        }
        return {
            roomId: room.id,
            slug: room.slug,
            participantCount: room.participants.length,
        };
    }
    async getMessages(slug) {
        const messages = await this.roomService.getMessagesBySlug(slug);
        return messages.map((m) => ({
            id: m.id,
            senderName: m.senderName,
            message: m.content,
            timestamp: m.createdAt.getTime(),
        }));
    }
};
exports.RoomController = RoomController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Get)(':slug/messages'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomController.prototype, "getMessages", null);
exports.RoomController = RoomController = __decorate([
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [room_service_js_1.RoomService])
], RoomController);
//# sourceMappingURL=room.controller.js.map