// tests/auth.test.ts
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/db";

beforeEach(async () => {
  // limpa antes de cada teste para garantir isolamento
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

const userPayload = {
  name: "Test User",
  email: "test@example.com",
  password: "123456",
};

async function registerUser(payload = userPayload, masterKey?: string) {
  const body: any = { ...payload };
  if (masterKey) body.masterKey = masterKey;
  return request(app).post("/auth/register").send(body);
}

async function loginAndGetToken(email = userPayload.email, password = userPayload.password) {
  const res = await request(app).post("/auth/login").send({ email, password });
  return res.body?.token;
}

describe("AUTH - E2E", () => {
  test("POST /auth/register deve registrar um usuário", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", userPayload.email);
  });

  test("POST /auth/login deve retornar token (após registrar)", async () => {
    await registerUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userPayload.email, password: userPayload.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });

  test("POST /auth/login deve falhar com senha errada", async () => {
    await registerUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: userPayload.email, password: "senhaErrada" });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /users/me deve devolver usuário autenticado", async () => {
    await registerUser();
    const token = await loginAndGetToken();
    expect(token).toBeDefined();

    const res = await request(app)
      .get("/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("email", userPayload.email);
  });

  test("GET /users/me sem token retorna 401", async () => {
    const res = await request(app).get("/users/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /users (list) — permite 200 (lista) ou 403 (proibido) dependendo da política", async () => {
    // registra um usuário comum
    await registerUser();

    const token = await loginAndGetToken();
    expect(token).toBeDefined();

    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    // tolerante: se a rota exigir ADMIN será 403; se listar, será 200 e um array
    expect([200, 403]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      // ao menos o usuário que criamos deve estar presente
      expect(res.body.some((u: any) => u.email === userPayload.email)).toBe(true);
    } else {
      // 403 — formato esperado: { error: "..."}
      expect(res.body).toHaveProperty("error");
    }
  });
});
