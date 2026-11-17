import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, shareReplay, switchMap, throwError, finalize } from 'rxjs';
import { AuthResponse } from './auth.models';
import { AuthService } from './auth.service';

// Compartilha um único refresh entre requisições simultâneas que receberem 401.
let refreshInFlight: Observable<AuthResponse> | null = null;

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthCall = /\/auth\/(login|refresh|register)$/.test(req.url);

  return next(withToken(req, auth.accessToken)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall || !auth.isAuthenticated()) {
        return throwError(() => err);
      }
      refreshInFlight ??= auth.refresh().pipe(
        shareReplay(1),
        finalize(() => (refreshInFlight = null)),
      );
      return refreshInFlight.pipe(
        switchMap((res) => next(withToken(req, res.accessToken))),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
