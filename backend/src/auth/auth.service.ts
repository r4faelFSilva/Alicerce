import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { hashToken, UsersService } from '../users/users.service.js';
import type { AuthTokens, JwtPayload } from './auth.types.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto);
    return this.issueTokens(user!);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findWithSecrets({ email: dto.email });
    const valid = user?.active && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) throw new UnauthorizedException('Credenciais inválidas');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const user = await this.users.findWithSecrets({ id: payload.sub });
    const matches =
      !!user?.refreshTokenHash &&
      timingSafeEqual(Buffer.from(hashToken(refreshToken)), Buffer.from(user.refreshTokenHash));
    if (!user || !user.active || !matches) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    return this.issueTokens(user);
  }

  logout(userId: string) {
    return this.users.setRefreshToken(userId, null);
  }

  /** Gera access + refresh e grava o hash do refresh (rotação a cada uso). */
  private async issueTokens(user: User): Promise<AuthTokens & { user: Partial<User> }> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        jwtid: randomUUID(), // garante token único a cada emissão
      }),
    ]);
    await this.users.setRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}
