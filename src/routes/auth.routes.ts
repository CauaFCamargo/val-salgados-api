import { Router } from "express";
import { login } from "../controllers/auth.controller";

export const authRoutes = Router();

// POST /auth/login → recebe usuario+senha, devolve o token.
authRoutes.post("/login", login);
