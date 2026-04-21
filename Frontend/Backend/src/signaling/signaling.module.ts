import { Module } from '@nestjs/common';
import { SignalingGateway } from './signaling.gateway.js';
import { RoomModule } from '../room/room.module.js';

@Module({
    imports: [RoomModule],
    providers: [SignalingGateway],
})
export class SignalingModule { }
