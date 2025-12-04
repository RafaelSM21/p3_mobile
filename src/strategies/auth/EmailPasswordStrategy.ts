import { AuthStrategy } from "./AuthStrategy";
import { prisma } from "../../db";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken"; // Importamos SignOptions aqui

// As constantes JWT_SECRET e JWT_EXPIRES_IN são inferidas como 'string'
// O TypeScript não vê problema aqui, mas sim na linha 19
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

export class EmailPasswordStrategy implements AuthStrategy {
  async authenticate(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    // Cria o token incluindo role
    const payload = { id: user.id, email: user.email, role: user.role };
    
    // CORREÇÃO: Usamos 'as SignOptions["expiresIn"]' para forçar o tipo estrito
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] 
    });

    // retornar token e dados do user sem a senha
    const { password: _, ...safeUser } = user as any;
    return { token, user: safeUser };
  }
}