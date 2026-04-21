"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_js_1 = require("./app.module.js");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    await app.listen(process.env.PORT || 3001, '0.0.0.0');
    console.log(`🚀 Backend running on port ${process.env.PORT || 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map