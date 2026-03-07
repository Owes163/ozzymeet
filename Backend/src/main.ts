import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // run now

  // 1. Safely parse the origins list (Splits by comma if you have multiple)
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [];

  // 2. Add localhost for local development fallback
  const origins = [
    ...allowedOrigins,
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port (http)
    'https://localhost:5173', // Vite default port (https)
  ];

  console.log('✅ Allowed CORS Origins:', origins);

  app.enableCors({
    origin: [
    "http://localhost:5173",
    "https://ozzymeet.vercel.app"
  ],
    credentials: true
  });

  // 3. IMPORTANT: Allow Railway to assign the port automatically
  await app.listen(process.env.PORT || 3001, '0.0.0.0');
  console.log(`🚀 Backend running on port ${process.env.PORT || 3001}`);
}
bootstrap();
