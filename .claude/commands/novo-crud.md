---
description: Cria um CRUD completo (backend + frontend) seguindo o padrão do módulo de clientes
argument-hint: <nome da entidade e campos>
---

Crie um CRUD completo para: $ARGUMENTS

Use o módulo `customers` como referência exata de padrão, nas duas pontas:

**Backend (`backend/src/<entidade>/`)**
1. Entidade TypeORM com `id` uuid, `createdAt` e `updatedAt`.
2. DTOs com class-validator (`Create`, `Update` e `List...Query` com paginação).
3. Service com listagem paginada e busca, `findOne` com `NotFoundException`.
4. Controller REST; exclusão restrita a `@Roles(UserRole.ADMIN)`.
5. Registre o módulo em `app.module.ts`.

**Frontend (`frontend/src/app/features/<entidade>/`)**
1. Service HTTP tipado.
2. Lista com busca, paginação e `rxResource`.
3. Formulário reativo único para criar/editar (rota `novo` e `:id`).
4. Rotas lazy em `app.routes.ts` e item no menu em `layout/shell.ts`.

Ao final, rode `npm run build` no backend e `npx ng build` no frontend e corrija qualquer erro.
Textos de interface em português; código em inglês.
