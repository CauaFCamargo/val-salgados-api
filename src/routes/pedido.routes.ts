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

// Públicos: criar pedido e consultar o status de um pedido pelo número.
pedidoRoutes.post("/", criarPedido);
pedidoRoutes.get("/:numero", buscarPedidoPublico);

// Protegidos (só a Val, com token): listar e mudar status.
pedidoRoutes.get("/", autenticar, listarPedidos);
pedidoRoutes.patch("/:id/status", autenticar, atualizarStatus);
pedidoRoutes.patch("/:id/impresso", autenticar, marcarImpresso);
