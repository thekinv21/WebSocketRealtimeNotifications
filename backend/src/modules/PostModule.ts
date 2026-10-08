import { Module } from '@nestjs/common';

import { PostController } from '@/controllers/PostController';

import { PostService } from '@/services/PostService';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
