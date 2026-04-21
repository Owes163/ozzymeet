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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const path_1 = require("path");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        let adapter;
        if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
            console.log('📂 Using PostgreSQL adapter');
            const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
            adapter = new adapter_pg_1.PrismaPg(pool);
        }
        else {
            if (process.env.NODE_ENV === 'production') {
                console.error('❌ ERROR: DATABASE_URL is missing or invalid in production! The app expects PostgreSQL but is falling back to SQLite, which will crash.');
            }
            const dbPath = (0, path_1.join)(process.cwd(), 'dev.db');
            console.log('📂 Using SQLite adapter. Database path:', dbPath);
            adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: dbPath });
        }
        super({ adapter });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map