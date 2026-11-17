# Alicerce — Angular + NestJS + PostgreSQL

Monorepo simples com duas pastas independentes:

- `backend/` — NestJS 12 (ESM), TypeORM, PostgreSQL, JWT com refresh token rotativo.
- `frontend/` — Angular 22 standalone, zoneless, signals, sem biblioteca de UI.

## Comandos

| Onde | Comando | O quê |
|---|---|---|
| raiz | `docker compose up db` | Sobe só o PostgreSQL |
| backend | `npm run start:dev` | API em http://localhost:3000/api |
| backend | `npm run build` / `npm run test:e2e` | Build / testes e2e (precisa do banco) |
| frontend | `npm start` | App em http://localhost:4200 |
| frontend | `npx ng build` / `npx ng test --watch=false` | Build / testes |

## Convenções

- **Código em inglês, textos de interface e mensagens de erro em português.**
- Backend é ESM: imports relativos terminam em `.js`; testes usam Vitest (`vi.fn()`).
- Toda rota é protegida por padrão (`JwtAuthGuard` global). Use `@Public()` para liberar
  e `@Roles(UserRole.ADMIN)` para restringir por perfil.
- Validação com class-validator + `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`).
- Instalar pacotes no backend: `npm i --legacy-peer-deps <pacote>`.
- Frontend: componentes standalone, `inject()`, signals, `rxResource` para dados,
  control flow nativo (`@if`, `@for`). Nada de NgModules nem Zone.js.
- Novo CRUD: siga o padrão de `customers` nas duas pontas (ou use `/novo-crud`).

## Segurança

- Refresh tokens são guardados como hash **SHA-256**, nunca bcrypt (bcrypt trunca em
  72 bytes e JWTs do mesmo usuário compartilham prefixo).
- `DB_SYNC=true` só em desenvolvimento. Em produção, use migrations.
- Nunca commitar `.env`.
