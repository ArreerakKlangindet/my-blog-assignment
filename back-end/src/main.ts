import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express'; // 💡 1. เพิ่มการ Import express

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🛠️ 2. เพิ่ม 2 บรรทัดนี้เพื่อขยายเพดานรับ Base64 ขนาดใหญ่ (สูงสุด 50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors();

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
