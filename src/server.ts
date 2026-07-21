import "dotenv/config";
import express from "express";
import cors from "cors";
import { pedidoRoutes } from "./routes/pedido.routes";
import { authRoutes } from "./routes/auth.routes";


const app = express();

// CORS: se CORS_ORIGIN estiver definido (produção), libera só aquela origem
// (o front no Vercel). Sem ele (desenvolvimento), libera geral.
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));
app.use(express.json());

// O Render (e a maioria das nuvens) define a porta via variável PORT.
// Em desenvolvimento, cai no 3000.
const PORT = Number(process.env.PORT) || 3000;

app.get("/", (req, res) => {
  res.json({ message: "API Val Salgados no ar! " });
});

app.use("/auth", authRoutes);
app.use("/pedidos", pedidoRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});