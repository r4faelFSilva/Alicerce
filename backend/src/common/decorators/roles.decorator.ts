import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity.js';

export const ROLES_KEY = 'roles';

/** Restringe a rota aos perfis informados. Ex.: @Roles(UserRole.ADMIN) */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
