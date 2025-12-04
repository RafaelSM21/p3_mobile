import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/db";

// limpar db ANTES de cada teste
beforeAll(async () => {
  await prisma.user.deleteMany({});
});

// fechar conexão após os testes
afterAll(async () => {
  await prisma.$disconnect();
});

describe("AUTH TESTS", () => {
  const user = {
    name: "Test User",
    email: "test@example.com",
    password: "123456",
  };

  test("POST /auth/register deve registrar um usuário", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send(user);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", user.email);
  });

  test("POST /auth/login deve retornar token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /auth/login deve falhar com senha errada", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: user.email, password: "senhaErrada" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
