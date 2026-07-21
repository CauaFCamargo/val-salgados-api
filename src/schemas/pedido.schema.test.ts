import { describe, it, expect } from "vitest";
import { criarPedidoSchema } from "./pedido.schema";

// Um pedido válido base, que cada teste modifica pro que quer checar.
const base = {
  clienteNome: "Ana",
  telefone: "15999998888",
  tipoEntrega: "RETIRADA" as const,
  formaPagamento: "PIX" as const,
  itens: [{ nome: "Coxinha", quantidade: 1, precoUnitario: 7 }],
};

describe("criarPedidoSchema", () => {
  it("aceita um pedido de retirada + PIX válido", () => {
    const r = criarPedidoSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("exige endereço quando é ENTREGA", () => {
    const r = criarPedidoSchema.safeParse({ ...base, tipoEntrega: "ENTREGA" });
    expect(r.success).toBe(false);
  });

  it("aceita ENTREGA quando tem endereço", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      tipoEntrega: "ENTREGA",
      endereco: "Rua X, 123",
    });
    expect(r.success).toBe(true);
  });

  it("rejeita troco quando o pagamento é PIX", () => {
    const r = criarPedidoSchema.safeParse({ ...base, trocoPara: 50 });
    expect(r.success).toBe(false);
  });

  it("aceita troco quando o pagamento é DINHEIRO", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      formaPagamento: "DINHEIRO",
      trocoPara: 50,
    });
    expect(r.success).toBe(true);
  });

  it("rejeita pedido sem itens", () => {
    const r = criarPedidoSchema.safeParse({ ...base, itens: [] });
    expect(r.success).toBe(false);
  });

  it("rejeita tipoEntrega inválido", () => {
    const r = criarPedidoSchema.safeParse({ ...base, tipoEntrega: "TELETRANSPORTE" });
    expect(r.success).toBe(false);
  });
});
