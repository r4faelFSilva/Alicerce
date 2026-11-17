import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { API_URL } from '../api/api.config';
import { AuthResponse, AuthUser } from './auth.models';

const STORAGE_KEY = 'auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<AuthResponse | null>(this.load());

  readonly user = computed<AuthUser | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  get accessToken() {
    return this.session()?.accessToken ?? null;
  }

  async login(email: string, password: string) {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }),
    );
    this.save(res);
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/refresh`, {
        refreshToken: this.session()?.refreshToken,
      })
      .pipe(tap((res) => this.save(res)));
  }

  logout() {
    if (this.session()) {
      this.http.post(`${API_URL}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.clear();
    this.router.navigate(['/login']);
  }

  clear() {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private save(res: AuthResponse) {
    this.session.set(res);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
  }

  private load(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}
