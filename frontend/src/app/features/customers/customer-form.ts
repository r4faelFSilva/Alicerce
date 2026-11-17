import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CustomersService } from './customers.service';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.html',
})
export class CustomerForm implements OnInit {
  private readonly service = inject(CustomersService);
  private readonly router = inject(Router);

  /** Vem da rota (:id) via withComponentInputBinding. */
  readonly id = input<string>();

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    document: [''],
    email: ['', Validators.email],
    phone: [''],
    active: [true],
  });

  async ngOnInit() {
    const id = this.id();
    if (!id) return;
    const c = await firstValueFrom(this.service.get(id));
    this.form.patchValue({
      name: c.name,
      document: c.document ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      active: c.active,
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    const data = {
      name: v.name,
      active: v.active,
      document: v.document || undefined,
      email: v.email || undefined,
      phone: v.phone || undefined,
    };
    try {
      const id = this.id();
      await firstValueFrom(id ? this.service.update(id, data) : this.service.create(data));
      await this.router.navigate(['/clientes']);
    } catch (e) {
      const msg = e instanceof HttpErrorResponse ? e.error?.message : null;
      this.error.set(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Erro ao salvar.'));
    } finally {
      this.saving.set(false);
    }
  }
}
