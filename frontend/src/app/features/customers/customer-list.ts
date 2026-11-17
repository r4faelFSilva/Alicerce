import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Customer, CustomersService } from './customers.service';

@Component({
  selector: 'app-customer-list',
  imports: [RouterLink],
  templateUrl: './customer-list.html',
})
export class CustomerList {
  private readonly service = inject(CustomersService);
  protected readonly auth = inject(AuthService);

  protected readonly search = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;

  protected readonly data = rxResource({
    params: () => ({ search: this.search(), page: this.page() }),
    stream: ({ params }) => this.service.list(params.search, params.page, this.pageSize),
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil((this.data.value()?.total ?? 0) / this.pageSize)),
  );

  private searchTimer?: ReturnType<typeof setTimeout>;
  onSearch(value: string) {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.search.set(value.trim());
    }, 300);
  }

  remove(c: Customer) {
    if (!confirm(`Excluir o cliente "${c.name}"?`)) return;
    this.service.remove(c.id).subscribe(() => this.data.reload());
  }
}
