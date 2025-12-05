# 🚀 API Node.js Completa: Auth JWT & Strategy Pattern

![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

> Uma API RESTful robusta focada em segurança, arquitetura limpa e extensibilidade.

Este projeto demonstra uma implementação profissional de autenticação utilizando **JSON Web Tokens (JWT)** e o **Design Pattern Strategy**, permitindo múltiplos métodos de login (Email/Senha padrão e Chave Mestra) de forma desacoplada. Inclui um frontend minimalista para testes de ponta a ponta.

---

## ✨ Recursos Principais

| Categoria | Recurso | Descrição |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express | API REST rápida e eficiente escrita em TypeScript. |
| **Banco de Dados** | PostgreSQL + Prisma | ORM moderno para gerenciamento de dados seguro e tipado. |
| **Segurança** | JWT | Autenticação *stateless* segura via tokens. |
| **Arquitetura** | **Strategy Pattern** | Estratégia de autenticação flexível e escalável. |
| **Controle** | RBAC (Role-Based) | Permissões granulares (ADMIN/USER) via Middleware. |
| **Frontend** | HTML/CSS/JS | Interface simples para validação visual dos fluxos. |
| **Testes** | TDD com Jest | Cobertura de testes unitários na camada de autenticação. |

---

## 📂 Estrutura do Projeto

A arquitetura segue princípios de separação de responsabilidades (SoC), facilitando a manutenção e a escalabilidade.

```text
projeto/
│
├── src/
│   ├── routes/         # Definição dos endpoints da API
│   ├── services/       # Lógica de negócio (ex: AuthService)
│   ├── middlewares/    # Interceptadores (JWT e Permissões)
│   ├── strategies/     # Implementações do Strategy Pattern
│   ├── db/             # Instância Singleton do Prisma Client
│   ├── app.ts          # Configuração dos middlewares do Express
│   └── server.ts       # Entry point do servidor
│
├── frontend/           # Interface de teste (Consumo da API)
├── prisma/             # Schema do banco e Migrações
└── __tests__/          # Testes Automatizados (Jest)
````

-----

## 🔒 Design Patterns

### Singleton

```bash
import "dotenv/config";
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
Usado para garantir uma única intância do Prisma Client  em toda a aplicação, evitando multiplas conexões com o banco

### Strategy

```bash
export class EmailPasswordStrategy implements AuthStrategy {
  async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const payload = { id: user.id, email: user.email, role: user.role };
    
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] 
    });

    const { password: _, ...safeUser } = user as any;
    return { token, user: safeUser };
  }
}
```

Usado para permitir mais de um modo de login (Com ou sem a Master Key)

### Facade

```bash
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
  private strategies: Record<string, AuthStrategy>;

  constructor(
    authService: AuthService,
    userService: UserService,
    strategies: Record<string, AuthStrategy>
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
      // Alguns tokens usam 'id' ou 'sub' (aqui assumimos 'id')
      const id = decoded?.id ?? decoded?.sub;
      if (!id) return null;
      // userService.getUser espera number; tente converter se precisar
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const user = await this.userService.getUser(numericId);
      return user ?? null;
    } catch (err) {
      return null;
    }
  }

  async ensureRole(userId: number | string, role: string) {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    const user = await this.userService.getUser(numericId);
    return user?.role === role;
  }

  static createDefault() {
    const authService = new AuthService();
    const userService = new UserService();
    const strategies: Record<string, AuthStrategy> = {
      email: new EmailPasswordStrategy(),
      master: new MasterKeyStrategy()
    };
    return new AuthFacade(authService, userService, strategies);
  }
}

export const authFacade = AuthFacade.createDefault();

```

O Facade centraliza a orquestração entre services e strategies, expondo uma API simples (login, register, validateToken) para routes e middlewares. Isso reduz acoplamento e facilita manutenção/testes: trocar uma strategy ou ajustar geração de token é feito apenas no Facade.

-----

## 🛠️ Configuração e Instalação

### 1\. Pré-requisitos

  * **Node.js** (v16 ou superior)
  * **PostgreSQL** rodando localmente ou em container.

### 2\. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e configure as chaves abaixo:

```env
# Conexão com o Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

# Segurança JWT
JWT_SECRET="seuSegredoSuperSeguroParaAssinatura"
JWT_EXPIRES_IN="8h"

# Chave Mestra para Login Administrativo
MASTER_KEY="SUA_CHAVE_MASTER_SECRETA_123"
```

### 3\. Instalação e Migração

```bash
# Instalar dependências
npm install

# Rodar migrações do Prisma (Cria as tabelas no banco)
npx prisma migrate dev

# Gerar tipagem do Prisma Client
npx prisma generate
```

-----

## ▶️ Executando o Projeto

### Modo Desenvolvimento (Backend)

O servidor subirá na porta `3000` com *hot-reload*.

```bash
npm run dev
```

### Frontend de Teste

Para testar a API visualmente, inicie o servidor de arquivos estáticos:

```bash
npx serve frontend
```

*Acesse em: `http://localhost:3000` (ou a porta indicada no terminal).*

-----

## 🖥 API Endpoints

Abaixo, a lista das principais rotas disponíveis.

| Método | Rota | Descrição | Token? | Role |
| :---: | :--- | :--- | :---: | :---: |
| `POST` | `/auth/register` | Criação de novo usuário. | ❌ | Pública |
| `POST` | `/auth/login` | Login (detecta estratégia via payload). | ❌ | Pública |
| `GET` | `/users` | Lista todos os usuários cadastrados. | ✅ | **ADMIN** |
| `GET` | `/users/:id` | Busca detalhes de um usuário. | ✅ | USER |
| `DELETE` | `/users/:id` | Remove um usuário do sistema. | ✅ | **ADMIN** |

-----

## 🧪 Testes

Os testes garantem a integridade da lógica de autenticação e das estratégias.

```bash
# Executar suite de testes completa
npm test
```

Deve retornar:
```bash
> projeto@1.0.0 test
> jest

 PASS  __tests__/auth.test.ts (10.56 s)
  AUTH - E2E
    √ POST /auth/register deve registrar um usuário (679 ms)
    √ POST /auth/login deve retornar token (após registrar) (327 ms)
    √ POST /auth/login deve falhar com senha errada (337 ms)
    √ GET /users/me deve devolver usuário autenticado (332 ms)
    √ GET /users/me sem token retorna 401 (9 ms)
    √ GET /users (list) — permite 200 (lista) ou 403 (proibido) dependendo da política (324 ms)

    Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        11.155 s
```
-----