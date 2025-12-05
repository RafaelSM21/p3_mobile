// src/middlewares/ensureRole.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function ensureRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // req.user.role já deve existir quando validateToken preenche user
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" });
    }

    next();
  };
}
