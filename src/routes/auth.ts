import { Router } from "express";
import { authService } from "../services/auth.service";
import { MasterKeyStrategy } from "../strategies/auth/MasterKeyStrategy"; // mantenha o caminho que você usa

const router = Router();

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password, mode } = req.body;

  try {
    if (mode === "master") {
      authService.setStrategy(new MasterKeyStrategy());
    }

    const result = await authService.login(email, password);

    // volta para padrão
    authService.setStrategy(null);

    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
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

    const user = await authService.register(name.trim(), email.trim().toLowerCase(), password, role);

    // não retornar senha no response
    const { password: _, ...safe } = user as any;
    return res.status(201).json(safe);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
