import { Router } from "express";
import {
  criarPedido,
  listarPedidos,
  atualizarStatus,
  buscarPedidoPublico,
  marcarImpresso,
} from "../controllers/pedido.controller";
import { autenticar } from "../middlewares/auth";

export const pedidoRoutes = Router();

// Públicos: criar pedido e consultar o status pelo TOKEN do pedido.
// O token é aleatório: quem tem o link entra, quem não tem não adivinha.
pedidoRoutes.post("/", criarPedido);
pedidoRoutes.get("/:token", buscarPedidoPublico);

// Protegidos (só a Val, com token): listar e mudar status.
pedidoRoutes.get("/", autenticar, listarPedidos);
pedidoRoutes.patch("/:id/status", autenticar, atualizarStatus);
pedidoRoutes.patch("/:id/impresso", autenticar, marcarImpresso);
