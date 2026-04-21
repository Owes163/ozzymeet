import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { RoomModule } from './room/room.module.js';
import { SignalingModule } from './signaling/signaling.module.js';

@Module({
  imports: [PrismaModule, RoomModule, SignalingModule],
})
export class AppModule { }
