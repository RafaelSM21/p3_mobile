import { prisma } from "../db"; // prisma singleton
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthStrategy } from "../strategies/auth/AuthStrategy";
import { EmailPasswordStrategy } from "../strategies/auth/EmailPasswordStrategy";

const JWT_SECRET: string = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "8h";

export class AuthService {
  private strategy: AuthStrategy;

  constructor(strategy?: AuthStrategy) {
    this.strategy = strategy || new EmailPasswordStrategy();
  }

  // permite setar null para voltar ao padrão
  setStrategy(strategy: AuthStrategy | null) {
    this.strategy = strategy || new EmailPasswordStrategy();
  }

  // delega para a strategy
  async login(email: string, password: string) {
    return this.strategy.authenticate(email, password);
  }

  /**
   * register(name, email, password, role?)
   * role: "USER" or "ADMIN"
   */
  async register(name: string, email: string, password: string, role = "USER") {
    // validação simples
    if (!name || !email || !password) throw new Error("Campos inválidos");

    // checa existência
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("User already exists");

    // hash da senha
    const hash = await bcrypt.hash(password, 10);

    // cria usuário com a role informada
    const newUser = await prisma.user.create({
      data: { name, email, password: hash, role },
      select: { id: true, name: true, email: true, role: true } // retorne só campos seguros
    });

    return newUser;
  }

  // (opcional) helper pra gerar token no AuthService caso prefira centralizar
  genToken(payload: Record<string, any>) {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as any 
    });
  }
}

export const authService = new AuthService();
