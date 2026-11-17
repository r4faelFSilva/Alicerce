import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { CustomersService } from '../customers/customers.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="page-header">
      <h1>Olá, {{ auth.user()?.name }}</h1>
    </div>
    <div class="stats">
      <div class="card stat">
        <span class="muted">Clientes cadastrados</span>
        <strong>{{ customers.value()?.total ?? '—' }}</strong>
      </div>
      <div class="card stat">
        <span class="muted">Seu perfil</span>
        <strong>{{ auth.isAdmin() ? 'Administrador' : 'Usuário' }}</strong>
      </div>
    </div>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .stat { display: flex; flex-direction: column; gap: 0.5rem; }
    .stat strong { font-size: 1.75rem; }
  `,
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  private readonly service = inject(CustomersService);
  protected readonly customers = rxResource({ stream: () => this.service.list('', 1, 1) });
}
