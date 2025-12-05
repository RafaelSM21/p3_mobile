// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { authFacade } from "../facades/AuthFacade";

export interface AuthRequest extends Request {
  user?: any;
}

export async function ensureAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token inválido" });
  }

  const token = parts[1];
  try {
    const user = await authFacade.validateToken(token);
    if (!user) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
    req.user = user; // user completo via UserService
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
