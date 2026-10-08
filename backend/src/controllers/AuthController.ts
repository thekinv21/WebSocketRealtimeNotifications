import { Controller } from '@nestjs/common';

import { AuthService } from '@/services/AuthService';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
