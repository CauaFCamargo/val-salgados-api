import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { loginSchema } from "../schemas/auth.schema";
import { AUTH } from "../config/auth";

export function login(req: Request, res: Response) {
  // 1. Valida o formato do corpo (usuario + senha).
  const resultado = loginSchema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.flatten().fieldErrors,
    });
  }

  const { usuario, senha } = resultado.data;

  // 2. Confere as credenciais contra as do .env.
  //    401 = "não autenticado" (credenciais erradas).
  if (usuario !== AUTH.usuario || senha !== AUTH.senha) {
    return res.status(401).json({ erro: "Usuário ou senha inválidos" });
  }

  // 3. Gera o "crachá" (JWT). Ele carrega quem é e expira sozinho.
  //    O front guarda esse token e manda em toda chamada protegida.
  const token = jwt.sign({ sub: usuario, role: "admin" }, AUTH.jwtSecret, {
    expiresIn: AUTH.expiraEm,
  });

  return res.json({ token });
}
