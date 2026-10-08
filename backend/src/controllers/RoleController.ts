import { Controller } from '@nestjs/common';

import { RoleService } from '@/services/RoleService';

@Controller('/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
}
