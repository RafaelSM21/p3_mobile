import express from "express";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import cors from "cors";

const app = express();

// para ler JSON
app.use(express.json());

app.use(cors());

// rotas
app.use("/auth", authRoutes);   // <<< ESSA LINHA CRIA /auth/login
app.use("/users", userRoutes);

// rota básica
app.get("/", (req, res) => {
  res.send("API funcionando");
});

export default app;
