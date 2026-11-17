import { Controller, Get, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import type { JwtPayload } from '../auth/auth.types.js';
import { UserRole } from './user.entity.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() current: JwtPayload) {
    const user = await this.users.findById(current.sub);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.users.findAll();
  }
}
