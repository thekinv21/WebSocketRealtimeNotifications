import { Module } from '@nestjs/common';

import { RoleController } from '@/controllers/RoleController';

import { RoleService } from '@/services/RoleService';

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
