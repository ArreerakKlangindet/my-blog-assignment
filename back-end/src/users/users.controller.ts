import { Controller, Get, UseGuards, Req, Logger } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: RequestWithUser) {
    this.logger.log(
      `🔍 Profile accessed successfully by: ${req.user.email} (Role: ${req.user.role})`,
    );
    return req.user;
  }
}
