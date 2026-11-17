import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../core/api/api.config';

export interface Customer {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type CustomerInput = Pick<Customer, 'name' | 'active'> &
  Partial<Pick<Customer, 'document' | 'email' | 'phone'>>;

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/customers`;

  list(search = '', page = 1, pageSize = 10) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<Page<Customer>>(this.url, { params });
  }

  get(id: string) {
    return this.http.get<Customer>(`${this.url}/${id}`);
  }

  create(data: CustomerInput) {
    return this.http.post<Customer>(this.url, data);
  }

  update(id: string, data: Partial<CustomerInput>) {
    return this.http.patch<Customer>(`${this.url}/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
