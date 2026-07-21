import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  criarPedidoSchema,
  atualizarStatusSchema,
  marcarImpressoSchema,
} from "../schemas/pedido.schema";
import { montarLinkWhatsapp } from "../services/whatsapp";
import { calcularValores } from "../services/calculo";

export async function criarPedido(req: Request, res: Response) {
  // 1. Valida o que chegou do front
  const resultado = criarPedidoSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.flatten().fieldErrors,
    });
  }

  const dados = resultado.data;

  // 2. O servidor calcula os valores (NUNCA confia nos totais que o cliente manda).
  const { subtotal, taxaEntrega, desconto, total } = calcularValores(
    dados.itens,
    dados.tipoEntrega
  );

  // Troco só é guardado quando o pagamento é em dinheiro.
  const trocoPara =
    dados.formaPagamento === "DINHEIRO" ? dados.trocoPara ?? null : null;

  // 3. Salva o pedido + seus itens de uma vez
  const pedido = await prisma.pedido.create({
    data: {
      clienteNome: dados.clienteNome,
      telefone: dados.telefone,
      tipoEntrega: dados.tipoEntrega,
      // Na retirada não há endereço; salva null em vez de string vazia.
      endereco: dados.tipoEntrega === "ENTREGA" ? dados.endereco : null,
      bairro: dados.bairro,
      complemento: dados.complemento,
      formaPagamento: dados.formaPagamento,
      trocoPara,
      subtotal,
      taxaEntrega,
      desconto,
      total,
      itens: {
        create: dados.itens,
      },
    },
    include: { itens: true },
  });

  // 4. Monta o link de WhatsApp já pronto pro cliente enviar o pedido.
  const whatsappUrl = montarLinkWhatsapp(pedido);

  // 5. Devolve o pedido criado + o link do WhatsApp
  return res.status(201).json({ ...pedido, whatsappUrl });
}

// GET /pedidos/:numero — status público de UM pedido (o cliente acompanha).
// Rota PÚBLICA: como o número é sequencial e "chutável", usamos `select` pra
// devolver só o necessário — nada de telefone, endereço, troco (dados sensíveis).
export async function buscarPedidoPublico(req: Request, res: Response) {
  const numero = Number(req.params.numero);
  if (Number.isNaN(numero)) {
    return res.status(400).json({ erro: "Número inválido" });
  }

  const pedido = await prisma.pedido.findUnique({
    where: { numero },
    select: {
      numero: true,
      status: true,
      criadoEm: true,
      tipoEntrega: true,
      total: true,
      clienteNome: true,
      itens: {
        select: { id: true, nome: true, quantidade: true, precoUnitario: true },
      },
    },
  });

  if (!pedido) {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }

  return res.json(pedido);
}

// GET /pedidos — lista todos os pedidos (dashboard da Val). Rota protegida.
// Os mais novos primeiro, já com os itens juntos.
export async function listarPedidos(_req: Request, res: Response) {
  const pedidos = await prisma.pedido.findMany({
    orderBy: { criadoEm: "desc" },
    include: { itens: true },
  });
  return res.json(pedidos);
}

// PATCH /pedidos/:id/status — avança o status do pedido. Rota protegida.
export async function atualizarStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: "id inválido" });
  }

  const resultado = atualizarStatusSchema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Status inválido",
      detalhes: resultado.error.flatten().fieldErrors,
    });
  }

  try {
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { status: resultado.data.status },
      include: { itens: true },
    });
    return res.json(pedido);
  } catch {
    // update lança se o id não existe → 404.
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }
}

// PATCH /pedidos/:id/impresso — o agente de impressão marca o pedido como
// impresso depois de mandar o cupom. Rota protegida.
export async function marcarImpresso(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: "id inválido" });
  }

  const resultado = marcarImpressoSchema.safeParse(req.body ?? {});
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.flatten().fieldErrors,
    });
  }

  // Sem corpo → true. Isso mantém o agente de impressão funcionando igual
  // (ele chama a rota sem corpo). O painel manda false pra reimprimir.
  const impresso = resultado.data.impresso ?? true;

  try {
    const pedido = await prisma.pedido.update({
      where: { id },
      data: { impresso },
    });
    return res.json({ id: pedido.id, impresso: pedido.impresso });
  } catch {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }
}
