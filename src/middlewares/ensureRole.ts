import { Response, NextFunction } from "express";
import { AuthRequest } from "./ensureAuth";

export function ensureRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access denied: insufficient permissions" });
    }

    next();
  };
}
