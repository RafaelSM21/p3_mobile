# 🚀 API Node.js: Auth JWT + Strategy Pattern (TypeScript)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge\&logo=typescript\&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge\&logo=express\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge\&logo=Prisma\&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge\&logo=jest\&logoColor=white)

> API RESTful demonstrando autenticação com **JWT**, arquitetura limpa e o uso do **Strategy** e **Facade** patterns. Inclui um frontend minimalista para testes e uma suíte de testes E2E com Jest + Supertest.

---

# ✨ Recursos Principais

* **Backend:** Node.js + Express em TypeScript
* **Banco de dados:** PostgreSQL + Prisma (ORM tipado)
* **Autenticação:** JWT (stateless)
* **Arquitetura:** Strategy Pattern para múltiplas formas de autenticação + Facade para orquestração
* **Controle de acesso:** RBAC (roles: `ADMIN`, `USER`) via middlewares
* **Frontend de teste:** HTML/CSS/JS simples para validar fluxos
* **Testes:** Jest + Supertest — testes E2E cobrindo registro, login e rotas protegidas

---

# 📂 Estrutura do projeto (exemplo)

```
projeto/
│
├── src/
│   ├── routes/         # Definição dos endpoints da API
│   ├── services/       # Lógica de negócio (ex: AuthService, UserService)
│   ├── middlewares/    # JWT, ensureRole, etc.
│   ├── strategies/     # Strategy Pattern implementations (EmailPassword, MasterKey)
│   ├── facades/        # AuthFacade (orquestra AuthService, UserService, Strategies)
│   ├── db/             # Singleton do Prisma Client
│   ├── app.ts          # Configuração do Express (middlewares, routes)
│   └── server.ts       # Entry point
│
├── frontend/           # Interface de teste (static)
├── prisma/             # schema.prisma e migrations
└── __tests__/ or tests/# Testes Jest + Supertest
```

---

# 🔒 Design Patterns usados (resumo + trecho)

## Singleton (Prisma client)

Garante uma única instância do Prisma Client para evitar muitas conexões simultâneas:

```ts
// src/db/prisma.ts
import { PrismaClient } from "@prisma/client";

class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient();
    }
    return PrismaSingleton.instance;
  }
}

export const prisma = PrismaSingleton.getInstance();
```

---

## Strategy (ex.: EmailPasswordStrategy)

Permite ter múltiplas formas de autenticação sem acoplar as rotas/serviços ao mecanismo concreto:

```ts
// src/strategies/auth/EmailPasswordStrategy.ts
import { AuthStrategy } from "./AuthStrategy";
import { prisma } from "../../db/prisma";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export class EmailPasswordStrategy implements AuthStrategy {
  async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    });

    const { password: _, ...safeUser } = user as any;
    return { token, user: safeUser };
  }
}
```

---

## Facade (AuthFacade)

Centraliza orquestração entre `AuthService`, `UserService` e as `Strategy`s, expondo uma interface simples para rotas e middlewares:

```ts
// src/facades/AuthFacade.ts
import jwt from "jsonwebtoken";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { AuthStrategy } from "../strategies/auth/AuthStrategy";
import { EmailPasswordStrategy } from "../strategies/auth/EmailPasswordStrategy";
import { MasterKeyStrategy } from "../strategies/auth/MasterKeyStrategy";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export class AuthFacade {
  private authService: AuthService;
  private userService: UserService;
  private strategies: { email: AuthStrategy; master: AuthStrategy };

  constructor(
    authService: AuthService,
    userService: UserService,
    strategies: { email: AuthStrategy; master: AuthStrategy }
  ) {
    this.authService = authService;
    this.userService = userService;
    this.strategies = strategies;
  }

  async login(email: string, password: string, mode?: string) {
    if (mode === "master") {
      return this.strategies.master.authenticate(email, password);
    }
    return this.strategies.email.authenticate(email, password);
  }

  async register(name: string, email: string, password: string, role = "USER") {
    return this.authService.register(name, email, password, role);
  }

  async validateToken(token: string) {
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const id = decoded?.id ?? decoded?.sub;
      if (!id) return null;
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const user = await this.userService.getUser(numericId);
      return user ?? null;
    } catch {
      return null;
    }
  }

  async ensureRole(userId: number | string, role: string) {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    const user = await this.userService.getUser(numericId);
    return user?.role === role;
  }

  static createDefault() {
    return new AuthFacade(
      new AuthService(),
      new UserService(),
      { email: new EmailPasswordStrategy(), master: new MasterKeyStrategy() }
    );
  }
}

export const authFacade = AuthFacade.createDefault();
```

---

# 🛠️ Configuração e instalação

## 1) Pré-requisitos

* Node.js v16+
* PostgreSQL rodando localmente ou em container
* `npm` ou `yarn`

## 2) Variáveis de ambiente

Crie `.env` na raiz com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="seuSegredoSuperSeguroParaAssinatura"
JWT_EXPIRES_IN="8h"
MASTER_KEY="SUA_CHAVE_MASTER_SECRETA_123"
```

> ⚠️ Nunca comite `.env` em repositório público.

## 3) Instalar e preparar

```bash
# instalar deps
npm install

# rodar migrações (se ainda não migrou)
npx prisma migrate dev

# gerar client do Prisma
npx prisma generate
```

---

# ▶️ Rodando o projeto

### Em desenvolvimento (hot-reload)

```bash
npm run dev
```

### Servir frontend estático (interface de teste)

```bash
npx serve frontend
```

*Acesse a interface estática via navegador (porta exibida pelo `serve`) — seu backend geralmente em [http://localhost:3000](http://localhost:3000).*

---

# 🖥️ Endpoints principais

> Observação: ajuste conforme implementações locais. Recomenda-se que `/users/me` exista para permitir que usuários normais consultem seus próprios dados; `/users` e `/users/:id` normalmente são protegidas a `ADMIN`.

|  Método  | Rota             | Descrição                                                  | Token? |           Role          |
| :------: | :--------------- | :--------------------------------------------------------- | :----: | :---------------------: |
|  `POST`  | `/auth/register` | Criar novo usuário (aceita `masterKey` para criar `ADMIN`) |    ❌   |         Pública         |
|  `POST`  | `/auth/login`    | Login (formato: `{ email, password, mode? }`)              |    ❌   |         Pública         |
|   `GET`  | `/users/me`      | Dados do usuário autenticado                               |    ✅   |     `USER` / `ADMIN`    |
|   `GET`  | `/users`         | Listar todos usuários                                      |    ✅   | **ADMIN** (recomendado) |
|   `GET`  | `/users/:id`     | Buscar usuário por id (recomendado: ADMIN-only)            |    ✅   |        **ADMIN**        |
| `DELETE` | `/users/:id`     | Deletar usuário                                            |    ✅   |        **ADMIN**        |

---

# 🧪 Testes (Jest + Supertest)

Os testes fornecidos são **E2E / integração**: sobem o app (Express + Prisma) e validam os endpoints reais.

### Rodar testes

```bash
npm test
```

Exemplo do que os testes cobrem (registro, login correto/errado, rota protegida `/users/me`, e lista `/users` com tolerância a políticas):

```
 PASS  __tests__/auth.test.ts
  AUTH - E2E
    √ POST /auth/register deve registrar um usuário
    √ POST /auth/login deve retornar token (após registrar)
    √ POST /auth/login deve falhar com senha errada
    √ GET /users/me deve devolver usuário autenticado
    √ GET /users/me sem token retorna 401
    √ GET /users — retorna 200 (lista) ou 403 (proibido) dependendo da política
```

-----
