import { describe, it, expect } from "vitest";
import { criarPedidoSchema } from "./pedido.schema";

// Um pedido válido base, que cada teste modifica pro que quer checar.
// A quantidade é 30 porque esse é o pedido mínimo da loja.
const base = {
  clienteNome: "Ana",
  telefone: "15999998888",
  tipoEntrega: "RETIRADA" as const,
  formaPagamento: "PIX" as const,
  itens: [{ nome: "Coxinha", quantidade: 30, precoUnitario: 4 }],
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

  // --- Nome e telefone ------------------------------------------------------

  it("rejeita nome com mais de 30 caracteres", () => {
    const r = criarPedidoSchema.safeParse({ ...base, clienteNome: "a".repeat(31) });
    expect(r.success).toBe(false);
  });

  it("aceita nome com exatamente 30 caracteres", () => {
    const r = criarPedidoSchema.safeParse({ ...base, clienteNome: "a".repeat(30) });
    expect(r.success).toBe(true);
  });

  it("aceita telefone formatado com máscara", () => {
    const r = criarPedidoSchema.safeParse({ ...base, telefone: "(15) 99851-2564" });
    expect(r.success).toBe(true);
  });

  it("aceita telefone fixo (10 dígitos)", () => {
    const r = criarPedidoSchema.safeParse({ ...base, telefone: "(15) 3221-4455" });
    expect(r.success).toBe(true);
  });

  it("rejeita telefone com dígitos de menos", () => {
    const r = criarPedidoSchema.safeParse({ ...base, telefone: "15998" });
    expect(r.success).toBe(false);
  });

  it("rejeita telefone com dígitos demais", () => {
    const r = criarPedidoSchema.safeParse({ ...base, telefone: "159985125649999" });
    expect(r.success).toBe(false);
  });

  // --- Pedido mínimo de 30 unidades -----------------------------------------

  it("rejeita pedido abaixo de 30 unidades", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      itens: [{ nome: "Coxinha", quantidade: 29, precoUnitario: 4 }],
    });
    expect(r.success).toBe(false);
  });

  it("aceita exatamente 30 unidades de um item só", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      itens: [{ nome: "Coxinha", quantidade: 30, precoUnitario: 4 }],
    });
    expect(r.success).toBe(true);
  });

  // O mínimo é a SOMA das quantidades, então dá pra misturar produtos.
  it("aceita 30 unidades somando produtos diferentes", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      itens: [
        { nome: "Coxinha", quantidade: 10, precoUnitario: 4 },
        { nome: "Esfiha", quantidade: 10, precoUnitario: 4 },
        { nome: "Empada de Frango", quantidade: 10, precoUnitario: 4.5 },
      ],
    });
    expect(r.success).toBe(true);
  });

  it("rejeita quando a soma de vários produtos dá menos de 30", () => {
    const r = criarPedidoSchema.safeParse({
      ...base,
      itens: [
        { nome: "Coxinha", quantidade: 10, precoUnitario: 4 },
        { nome: "Esfiha", quantidade: 10, precoUnitario: 4 },
      ],
    });
    expect(r.success).toBe(false);
  });
});
