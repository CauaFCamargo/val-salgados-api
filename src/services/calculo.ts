import { TAXA_ENTREGA } from "../config/empresa";

// Função PURA: mesmas entradas → mesma saída, sem tocar banco nem rede.
// Por isso é fácil de testar (é o coração da regra de dinheiro).

export interface ItemCalculo {
  quantidade: number;
  precoUnitario: number;
}

export interface ValoresPedido {
  subtotal: number;
  taxaEntrega: number;
  desconto: number;
  total: number;
}

export function calcularValores(
  itens: ItemCalculo[],
  tipoEntrega: string
): ValoresPedido {
  const subtotal = itens.reduce(
    (soma, item) => soma + item.precoUnitario * item.quantidade,
    0
  );
  // Entrega só é cobrada em ENTREGA — e hoje a Val não cobra (grátis → 0).
  const taxaEntrega = tipoEntrega === "ENTREGA" ? TAXA_ENTREGA : 0;
  const desconto = 0; // regra de desconto entra no futuro
  const total = subtotal + taxaEntrega - desconto;

  return { subtotal, taxaEntrega, desconto, total };
}
