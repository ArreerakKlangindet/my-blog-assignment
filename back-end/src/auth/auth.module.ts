import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtModuleOptions } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtConfig = configService.get<JwtModuleOptions>('jwt');
        if (!jwtConfig) {
          throw new Error('JWT configuration is missing');
        }
        return jwtConfig;
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
