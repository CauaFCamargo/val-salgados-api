import { z } from "zod";

// Valida o corpo do login. Mesma ideia dos outros schemas: nunca confiar no
// que chega do cliente sem checar o formato antes.
export const loginSchema = z.object({
  usuario: z.string().min(1, "Usuário é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;
