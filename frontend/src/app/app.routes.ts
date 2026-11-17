import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/customers/customer-list').then((m) => m.CustomerList),
          },
          {
            path: 'novo',
            loadComponent: () =>
              import('./features/customers/customer-form').then((m) => m.CustomerForm),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/customers/customer-form').then((m) => m.CustomerForm),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
