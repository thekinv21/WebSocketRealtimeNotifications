import { Controller } from '@nestjs/common';

import { PostService } from '@/services/PostService';

@Controller('/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
}
