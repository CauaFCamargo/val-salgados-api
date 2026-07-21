import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AUTH } from "../config/auth";

// Middleware = função que roda ANTES do controller. Aqui ela funciona como o
// porteiro: só deixa passar (next()) quem trouxer um token válido no cabeçalho
// "Authorization: Bearer <token>". Senão, responde 401 e o controller nem roda.
export function autenticar(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  const token = header.slice("Bearer ".length);

  try {
    // verify confere a assinatura E a expiração. Se algo estiver errado, lança erro.
    jwt.verify(token, AUTH.jwtSecret);
    return next(); // token ok → segue pro controller
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}
