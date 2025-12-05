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

  // Fluxo de login: usa a strategy adequada e retorna o objeto que a strategy produzir
  async login(email: string, password: string, mode?: string) {
    if (mode === "master") {
      return this.strategies.master.authenticate(email, password);
    }
    return this.strategies.email.authenticate(email, password);
  }

  // Registrar delega ao AuthService (mantendo lógica atual)
  async register(name: string, email: string, password: string, role = "USER") {
    return this.authService.register(name, email, password, role);
  }

  // Valida token, retorna usuário completo (ou null)
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

  // Garantir role por id
  async ensureRole(userId: number | string, role: string) {
    const numericId = typeof userId === "string" ? parseInt(userId, 10) : userId;
    const user = await this.userService.getUser(numericId);
    return user?.role === role;
  }

  // Fábrica padrão para usar no app
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

// exporta um singleton conveniente para uso por rotas / middlewares
export const authFacade = AuthFacade.createDefault();
