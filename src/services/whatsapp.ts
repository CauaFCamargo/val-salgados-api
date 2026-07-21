import { EMPRESA } from "../config/empresa";

// Tipagem estrutural: só o que a mensagem precisa. Não importamos o tipo do
// Prisma de propósito, pra este serviço não depender do banco (fica testável).
interface ItemParaMensagem {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

interface PedidoParaMensagem {
  numero: number;
  criadoEm: Date;
  clienteNome: string;
  telefone: string;
  tipoEntrega: string;
  endereco: string | null;
  formaPagamento: string;
  trocoPara: number | null;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  itens: ItemParaMensagem[];
}

// "R$ 8,00" a partir de 8. (A API não tem o Intl do front, então formatamos aqui.)
function real(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

const LINHA = "------------------------------";

export function montarMensagemWhatsapp(pedido: PedidoParaMensagem): string {
  const data = pedido.criadoEm.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const linhas: string[] = [];
  linhas.push("Pedido Val Salgados aceito! ✅");
  linhas.push(`Acompanhe: ${EMPRESA.appUrl}/pedido/${pedido.numero}`);
  linhas.push(`Pedido: #${pedido.numero} (${data})`);
  linhas.push(LINHA);
  linhas.push(`NOME: ${pedido.clienteNome}`);
  linhas.push(`Fone: ${pedido.telefone}`);

  // Entrega mostra o endereço do cliente; retirada mostra a loja.
  if (pedido.tipoEntrega === "ENTREGA") {
    linhas.push(`Endereço: ${pedido.endereco ?? "-"}`);
  } else {
    linhas.push(`Retirada na loja: ${EMPRESA.endereco}`);
  }

  linhas.push(LINHA);
  for (const item of pedido.itens) {
    const subtotalItem = item.precoUnitario * item.quantidade;
    linhas.push(`${item.quantidade}x ${item.nome} — ${real(subtotalItem)}`);
  }

  linhas.push(LINHA);
  linhas.push(`Itens: ${real(pedido.subtotal)}`);
  // Só faz sentido falar de entrega quando é ENTREGA. A Val não cobra: "Grátis".
  if (pedido.tipoEntrega === "ENTREGA") {
    linhas.push(
      `Entrega: ${pedido.taxaEntrega === 0 ? "Grátis" : real(pedido.taxaEntrega)}`
    );
  }
  linhas.push(`TOTAL: ${real(pedido.total)}`);
  linhas.push(LINHA);

  // Pagamento: PIX mostra a chave; dinheiro mostra o troco (se informado).
  if (pedido.formaPagamento === "PIX") {
    linhas.push("Pagamento: PIX");
    linhas.push(`Chave PIX: ${EMPRESA.chavePix}`);
  } else {
    linhas.push("Pagamento: Dinheiro");
    if (pedido.trocoPara != null) {
      const troco = pedido.trocoPara - pedido.total;
      linhas.push(
        `Troco para: ${real(pedido.trocoPara)} (troco: ${real(troco)})`
      );
    }
  }

  return linhas.join("\n");
}

// Monta o link https://wa.me/NUMERO?text=... com a mensagem codificada pra URL.
export function montarLinkWhatsapp(pedido: PedidoParaMensagem): string {
  const texto = montarMensagemWhatsapp(pedido);
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`;
}
