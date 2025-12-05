// src/routes/auth.ts
import { Router } from "express";
import { authFacade } from "../facades/AuthFacade";

const router = Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password, mode } = req.body;

  try {
    const result = await authFacade.login(email, password, mode);
    // result deve ser { token, user } conforme suas strategies atuais
    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ error: err.message ?? "Unauthorized" });
  }
});

// REGISTER (aceita opcionalmente masterKey para criar ADMIN)
router.post("/register", async (req, res) => {
  const { name, email, password, masterKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email e password são obrigatórios" });
  }

  try {
    // decide role com base na masterKey (se correta, cria ADMIN)
    let role = "USER";
    if (typeof masterKey === "string" && masterKey.length > 0) {
      if (masterKey === process.env.MASTER_KEY) {
        role = "ADMIN";
      } else {
        return res.status(401).json({ error: "Master key inválida" });
      }
    }

    const user = await authFacade.register(name.trim(), email.trim().toLowerCase(), password, role);

    // não retornar senha no response
    const { password: _, ...safe } = user as any;
    return res.status(201).json(safe);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
