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

## 🔒 Autenticação e Design Patterns

O diferencial deste projeto é a aplicação do **Strategy Pattern** no fluxo de login. Isso permite que a API suporte diferentes mecanismos de entrada sem alterar a lógica principal do serviço.

### 🔑 Estratégias Implementadas

1.  **EmailPasswordStrategy (Padrão):**

      * Valida credenciais tradicionais (email e senha com hash).
      * Fluxo comum para usuários finais.

2.  **MasterKeyStrategy (Admin):**

      * Autenticação via `MASTER_KEY` definida no servidor.
      * Ideal para *bootstrapping* do sistema ou criação do primeiro superusuário (ADMIN).

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

## 💾 Modelo de Dados (Prisma)

O schema é enxuto, utilizando Enums ou Strings para controle de acesso.

```prisma
model User {
  id        Int     @id @default(autoincrement())
  name      String
  email     String  @unique
  password  String
  role      String  @default("USER") // ou 'ADMIN'

  @@map("users")
}
```

-----

## 🧪 Testes

Os testes garantem a integridade da lógica de autenticação e das estratégias.

```bash
# Executar suite de testes completa
npm test
```

-----

\<p align="center"\>
Desenvolvido com 💙 e TypeScript
\</p\>

```

### O que foi melhorado:

1.  **Cabeçalho Visual:** Adicionei um título claro e os "badges" (escudos coloridos) das tecnologias. Isso dá credibilidade imediata ao repositório.
2.  **Tabelas Formatadas:** Transformei as listas de recursos e endpoints em tabelas Markdown reais, o que facilita muito a leitura rápida.
3.  **Blocos de Código:** Usei a sintaxe correta (` typescript,  `bash, ` env,  `prisma) para que o código fique colorido e legível no GitHub/GitLab.
4.  **Diagrama Mental:** Adicionei um *placeholder* estratégico para o Strategy Pattern. Como o conceito é abstrato, ver onde ele se encaixa visualmente ajuda muito.
5.  **Hierarquia:** O uso correto de `##` e `###` cria um índice navegável automaticamente na maioria das plataformas de git.

\*\*Gostaria que eu gerasse o código UML (texto para Mermaid.js) para você inserir no lugar onde coloquei a tag \`

[Image of Strategy Pattern...]
\`?\*\*
```
