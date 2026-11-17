# Alicerce

> Base sólida para sistemas administrativos com Angular + NestJS.

Starter kit pronto para sistemas administrativos e corporativos: autenticação completa,
controle de acesso por perfil, CRUD de exemplo e layout responsivo.

**Stack:** Angular 22 (standalone, zoneless, signals) · NestJS 12 · TypeORM · PostgreSQL · Docker

## O que já vem pronto

- Login com JWT + refresh token rotativo (token reutilizado é rejeitado)
- Renovação automática de sessão no frontend (interceptor com fila de 401)
- Rotas protegidas por padrão e controle por perfil (`admin` / `user`) no back e no front
- CRUD de clientes com busca, paginação e validação
- Layout administrativo responsivo (sidebar, topbar, dashboard)
- Docker Compose com PostgreSQL, API e frontend
- Configurado para Claude Code (`CLAUDE.md`, comando `/novo-crud`)

## Rodando em 3 passos

```bash
# 1. Banco
docker compose up -d db

# 2. API
cd backend
cp .env.example .env
npm install --legacy-peer-deps
npm run start:dev

# 3. Frontend (outro terminal)
cd frontend
npm install
npm start
```

Acesse http://localhost:4200 com `admin@exemplo.com` / `Admin@12345`
(definidos em `backend/.env`).

Ou tudo com Docker: `cp backend/.env.example backend/.env && docker compose up --build`.

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/register` · `/login` · `/refresh` | Público |
| POST | `/api/auth/logout` | Autenticado |
| GET | `/api/users/me` | Autenticado |
| GET | `/api/users` | Admin |
| GET/POST/PATCH | `/api/customers` | Autenticado |
| DELETE | `/api/customers/:id` | Admin |
| GET | `/api/health` | Público |

## Desenvolvendo com IA

O projeto já vem preparado para o Claude Code:

- `CLAUDE.md` descreve stack, convenções e regras de segurança.
- `.claude/settings.json` define o modelo do projeto.
- `/novo-crud produto com nome, preço e estoque` gera backend + frontend no padrão do kit.

## Licença

MIT
