// src/routes/users.ts
import { Router } from "express";
import { UserService } from "../services/user.service";
import { ensureAuth, AuthRequest } from "../middlewares/auth";
import { ensureRole } from "../middlewares/ensureRole"; // certifique-se do caminho/nome

const router = Router();
const service = new UserService();

/**
 * GET /        -> lista todos (APENAS ADMIN)
 * Note: este router deve ser montado em app.use('/users', userRouter)
 */
router.get("/", ensureAuth, ensureRole("ADMIN"), async (req, res) => {
  try {
    const users = await service.listUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

/**
 * GET /me -> retorna perfil do usuário logado
 */
router.get("/me", ensureAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ error: "Não autorizado" });

    const user = await service.getUser(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

/**
 * GET /:id -> ver usuário por id (ADMIN ou dono do perfil)
 */
router.get("/:id", ensureAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const requester = req.user;
    // admin pode ver qualquer, usuário só o próprio
    if (requester.role !== "ADMIN" && requester.id !== id) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    const user = await service.getUser(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

/**
 * PUT /:id -> atualizar usuário (apenas dono ou admin)
 * Exemplo simples: atualiza name e email
 */
router.put("/:id", ensureAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const { name, email } = req.body;
  try {
    const requester = req.user;
    if (requester.role !== "ADMIN" && requester.id !== id) {
      return res.status(403).json({ error: "Permissão negada" });
    }

    const updated = await service.updateUser(id, { name, email });
    res.json(updated);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

/**
 * DELETE /:id -> deletar usuário (APENAS ADMIN)
 */
router.delete("/:id", ensureAuth, ensureRole("ADMIN"), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    await service.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;
