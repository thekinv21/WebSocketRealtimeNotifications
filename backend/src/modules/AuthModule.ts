import { Module } from '@nestjs/common';

import { AuthController } from '@/controllers/AuthController';

import { AuthService } from '@/services/AuthService';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
