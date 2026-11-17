import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from './customer.entity.js';
import { CreateCustomerDto, ListCustomersQuery, UpdateCustomerDto } from './dto/customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private readonly repo: Repository<Customer>) {}

  async list({ search, page, pageSize }: ListCustomersQuery) {
    const where = search
      ? [{ name: ILike(`%${search}%`) }, { document: ILike(`%${search}%`) }]
      : undefined;
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const customer = await this.repo.findOneBy({ id });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    await this.ensureUniqueDocument(dto.document);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    if (dto.document && dto.document !== customer.document) {
      await this.ensureUniqueDocument(dto.document);
    }
    return this.repo.save(this.repo.merge(customer, dto));
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    await this.repo.remove(customer);
  }

  private async ensureUniqueDocument(document?: string | null) {
    if (document && (await this.repo.existsBy({ document }))) {
      throw new ConflictException('Documento já cadastrado');
    }
  }
}
