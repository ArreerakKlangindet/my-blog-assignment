import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    this.logger.log(`👤 Register attempt for email: ${email}`);

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      this.logger.warn(`⚠️ Registration failed: Email ${email} already exists`);
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(
      `✅ User registered and token generated successfully: ${email} (ID: ${user.id})`,
    );

    return {
      accessToken,
    };
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    this.logger.log(`🔓 Login attempt for email: ${email}`);

    const user = await this.usersService.findByEmail(email, true);

    if (!user) {
      this.logger.warn(`⚠️ Login failed: User not found with email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      this.logger.warn(
        `⚠️ Login failed: Incorrect password for email: ${email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    this.logger.log(`🎉 Login successful! Token issued for: ${email}`);

    return {
      accessToken,
    };
  }
}
