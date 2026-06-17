import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { StringValue } from 'ms';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only',

    signOptions: {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as StringValue,
    },
  }),
);
