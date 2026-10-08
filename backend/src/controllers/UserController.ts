import { Controller } from '@nestjs/common';

import { UserService } from '@/services/UserService';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
