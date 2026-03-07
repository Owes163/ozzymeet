import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "http://localhost:5173",
      "https://localhost:5173",
      "https://ozzymeet.vercel.app"
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001, '0.0.0.0');

  console.log(`🚀 Backend running on port ${process.env.PORT || 3001}`);
}

bootstrap();