import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { validateEnv } from '@/config';

import { PostModule } from './PostModule';
import { RoleModule } from './RoleModule';
import { UserModule } from './UserModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    UserModule,
    RoleModule,
    PostModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
