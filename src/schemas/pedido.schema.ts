import { z } from "zod";

export const criarPedidoSchema = z
  .object({
    clienteNome: z.string().min(1, "Nome é obrigatório"),
    telefone: z.string().min(8, "Telefone inválido"),

    // Entrega x Retirada. O endereço vem opcional aqui e a obrigatoriedade
    // "de verdade" é decidida lá embaixo no superRefine, conforme o tipo.
    tipoEntrega: z.enum(["ENTREGA", "RETIRADA"]),
    endereco: z.string().optional(),
    bairro: z.string().optional(),
    complemento: z.string().optional(),

    // Pagamento. `trocoPara` é o valor que o cliente vai entregar em espécie.
    formaPagamento: z.enum(["PIX", "DINHEIRO"]),
    trocoPara: z.number().positive().optional(),

    itens: z
      .array(
        z.object({
          nome: z.string().min(1),
          quantidade: z.number().int().positive(),
          precoUnitario: z.number().positive(),
        })
      )
      .min(1, "O pedido precisa ter pelo menos 1 item"),
  })
  // superRefine = regras que dependem de MAIS DE UM campo ao mesmo tempo.
  .superRefine((dados, ctx) => {
    // 1) Se for ENTREGA, o endereço passa a ser obrigatório.
    if (
      dados.tipoEntrega === "ENTREGA" &&
      (!dados.endereco || dados.endereco.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endereco"], // aponta o erro pro campo certo (o front destaca ele)
        message: "Endereço é obrigatório para entrega",
      });
    }

    // 2) "Troco para" só faz sentido quando o pagamento é em dinheiro.
    if (dados.formaPagamento === "PIX" && dados.trocoPara != null) {
      ctx.addIssue({
        code: "custom",
        path: ["trocoPara"],
        message: "Troco só se aplica a pagamento em dinheiro",
      });
    }
  });

export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>;

// Status válidos de um pedido, na ordem do fluxo. CANCELADO é o desvio.
export const STATUS_VALIDOS = [
  "RECEBIDO",
  "EM_PRODUCAO",
  "PRONTO",
  "ENTREGUE",
  "CANCELADO",
] as const;

// Valida o corpo do PATCH de status: só aceita um dos valores acima.
export const atualizarStatusSchema = z.object({
  status: z.enum(STATUS_VALIDOS),
});
