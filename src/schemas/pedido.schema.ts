import { z } from "zod";
import { PEDIDO_MINIMO_UNIDADES } from "../config/empresa";

export const criarPedidoSchema = z
  .object({
    clienteNome: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório")
      .max(30, "O nome pode ter no máximo 30 caracteres"),

    // O front manda formatado — "(15) 99851-2564" —, então validamos pela
    // quantidade de DÍGITOS: 10 = fixo com DDD, 11 = celular com DDD.
    telefone: z.string().refine((valor) => {
      const digitos = valor.replace(/\D/g, "");
      return digitos.length === 10 || digitos.length === 11;
    }, "Telefone inválido: informe DDD + número"),

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

    // 3) Pedido mínimo: soma das QUANTIDADES de todos os itens, não a
    //    quantidade de produtos diferentes. Então 30 coxinhas vale, e
    //    10 coxinhas + 10 esfihas + 10 empadas também vale.
    const unidades = dados.itens.reduce((soma, item) => soma + item.quantidade, 0);
    if (unidades < PEDIDO_MINIMO_UNIDADES) {
      ctx.addIssue({
        code: "custom",
        path: ["itens"],
        message: `O pedido mínimo é de ${PEDIDO_MINIMO_UNIDADES} unidades (o seu tem ${unidades}).`,
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

// Corpo do PATCH /pedidos/:id/impresso. É OPCIONAL de propósito: o agente de
// impressão chama a rota sem corpo nenhum (só quer dizer "imprimi"), enquanto o
// painel manda { impresso: false } pra jogar o pedido de volta na fila.
export const marcarImpressoSchema = z.object({
  impresso: z.boolean().optional(),
});
