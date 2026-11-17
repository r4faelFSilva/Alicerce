import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Requer o PostgreSQL rodando (docker compose up db).
describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /health é público', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('GET /customers exige token', () => {
    return request(app.getHttpServer()).get('/customers').expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
