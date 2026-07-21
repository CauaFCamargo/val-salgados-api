import { describe, it, expect } from "vitest";
import { montarMensagemWhatsapp, montarLinkWhatsapp } from "./whatsapp";

// Um pedido de exemplo pra montar a mensagem.
const pedidoBase = {
  numero: 42,
  token: "8f3a1c9e-4b2d-4e77-9a15-c0de7b2f1e88",
  criadoEm: new Date("2026-07-21T09:00:00"),
  clienteNome: "Ana",
  telefone: "15999998888",
  tipoEntrega: "ENTREGA",
  endereco: "Rua das Flores",
  numeroEndereco: "123",
  bairro: "Centro",
  cidade: "Sorocaba",
  cep: "18103-000",
  complemento: null as string | null,
  formaPagamento: "PIX",
  trocoPara: null as number | null,
  subtotal: 16,
  taxaEntrega: 0,
  total: 16,
  itens: [{ nome: "Empada de Frango", quantidade: 2, precoUnitario: 8 }],
};

describe("montarMensagemWhatsapp", () => {
  // Guarda de segurança: o link de acompanhamento precisa usar o token
  // aleatório. Se algum dia voltar a usar o `numero` (sequencial), qualquer
  // pessoa conseguiria ler os pedidos dos outros contando 1, 2, 3...
  it("usa o token, e não o número, no link de acompanhamento", () => {
    const msg = montarMensagemWhatsapp(pedidoBase);
    expect(msg).toContain(`/pedido/${pedidoBase.token}`);
    expect(msg).not.toContain(`/pedido/${pedidoBase.numero}`);
  });

  it("inclui número, cliente e itens", () => {
    const msg = montarMensagemWhatsapp(pedidoBase);
    expect(msg).toContain("#42");
    expect(msg).toContain("Ana");
    expect(msg).toContain("2x Empada de Frango");
  });

  it("mostra a chave PIX quando o pagamento é PIX", () => {
    const msg = montarMensagemWhatsapp(pedidoBase);
    expect(msg).toContain("Pagamento: PIX");
    expect(msg).toContain("Chave PIX:");
  });

  it("mostra o troco quando é dinheiro, e não mostra chave PIX", () => {
    const msg = montarMensagemWhatsapp({
      ...pedidoBase,
      formaPagamento: "DINHEIRO",
      trocoPara: 50,
    });
    expect(msg).toContain("Pagamento: Dinheiro");
    expect(msg).toContain("Troco para");
    expect(msg).not.toContain("Chave PIX:");
  });

  it("mostra 'Retirada na loja' quando é retirada", () => {
    const msg = montarMensagemWhatsapp({ ...pedidoBase, tipoEntrega: "RETIRADA" });
    expect(msg).toContain("Retirada na loja");
  });
});

describe("montarLinkWhatsapp", () => {
  it("gera um link wa.me com o texto codificado", () => {
    const link = montarLinkWhatsapp(pedidoBase);
    expect(link).toContain("https://wa.me/");
    expect(link).toContain("?text=");
    // O "#" do número vira "%23" quando codificado pra URL.
    expect(link).toContain("%23");
  });
});
