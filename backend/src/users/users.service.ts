import { ConflictException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity.js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  /** Cria o admin inicial (ADMIN_EMAIL / ADMIN_PASSWORD) se ainda não existir. */
  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;
    if (await this.repo.existsBy({ email })) return;
    await this.create({ name: 'Administrador', email, password, role: UserRole.ADMIN });
    this.logger.log(`Admin inicial criado: ${email}`);
  }

  async create(data: { name: string; email: string; password: string; role?: UserRole }) {
    if (await this.repo.existsBy({ email: data.email })) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const user = this.repo.create({
      name: data.name,
      email: data.email,
      role: data.role ?? UserRole.USER,
      passwordHash: await bcrypt.hash(data.password, 10),
    });
    const saved = await this.repo.save(user);
    return this.findById(saved.id);
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  /** Busca incluindo campos sensíveis (uso interno da autenticação). */
  findWithSecrets(where: { id?: string; email?: string }) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where(where)
      .getOne();
  }

  async setRefreshToken(id: string, token: string | null) {
    // SHA-256 (não bcrypt): bcrypt ignora bytes após o 72º, e JWTs do mesmo
    // usuário compartilham o mesmo prefixo — tokens antigos passariam na comparação.
    const refreshTokenHash = token ? hashToken(token) : null;
    await this.repo.update(id, { refreshTokenHash });
  }
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
