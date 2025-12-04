import { AuthStrategy } from "./AuthStrategy";
import jwt, { SignOptions } from "jsonwebtoken"; // Importamos 'SignOptions'

// As constantes continuam as mesmas, inferidas como string
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h"; // Ensure this is a valid string or number

export class MasterKeyStrategy implements AuthStrategy {
  async authenticate(email: string, password: string) {
    if (password !== process.env.MASTER_KEY) {
      throw new Error("Invalid master key");
    }

    // Se quiser vincular a um user real, procure no banco; aqui criamos token admin
    const payload = { id: 0, email: email ?? "master", role: "ADMIN" };
    
    // CORREÇÃO: Usamos 'as SignOptions["expiresIn"]' para forçar o tipo estrito
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] // Aplica o casting específico
    });

    return {
      token,
      user: { id: 0, name: "Master", email: email ?? "master", role: "ADMIN" }
    };
  }
}