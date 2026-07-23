import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  criarPedidoSchema,
  atualizarStatusSchema,
  filaImpressaoSchema,
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
      // Na retirada não há endereço; salva null em vez de string vazia — assim
      // o banco não guarda lixo e a leitura fica sem ambiguidade.
      ...(dados.tipoEntrega === "ENTREGA"
        ? {
            endereco: dados.endereco,
            numeroEndereco: dados.numeroEndereco,
            bairro: dados.bairro,
            cidade: dados.cidade,
            cep: dados.cep,
            complemento: dados.complemento,
          }
        : {
            endereco: null,
            numeroEndereco: null,
            bairro: null,
            cidade: null,
            cep: null,
            complemento: null,
          }),
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
  // Busca pelo TOKEN, nunca pelo número. O número é sequencial: se ele desse
  // acesso, bastaria contar 1, 2, 3... pra ler os pedidos de outras pessoas.
  // No Express 5 um parâmetro pode vir repetido, então o tipo é
  // `string | string[]`. Só aceitamos uma string única e não vazia.
  const token = req.params.token;
  if (typeof token !== "string" || token.trim() === "") {
    return res.status(400).json({ erro: "Token inválido" });
  }

  const pedido = await prisma.pedido.findUnique({
    where: { token },
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

// PATCH /pedidos/:id/impressao — põe/tira uma via da fila de impressão.
// O painel usa pra pedir uma via; o agente usa pra dar baixa depois de imprimir.
export async function atualizarFilaImpressao(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ erro: "id inválido" });
  }

  const resultado = filaImpressaoSchema.safeParse(req.body ?? {});
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.flatten().fieldErrors,
    });
  }

  // Atualiza só as vias que vieram no corpo (cada uma é independente).
  const data: { filaCliente?: boolean; filaLoja?: boolean } = {};
  if (resultado.data.cliente !== undefined) data.filaCliente = resultado.data.cliente;
  if (resultado.data.loja !== undefined) data.filaLoja = resultado.data.loja;

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ erro: "Informe a via (cliente e/ou loja)" });
  }

  try {
    const pedido = await prisma.pedido.update({ where: { id }, data });
    return res.json({
      id: pedido.id,
      filaCliente: pedido.filaCliente,
      filaLoja: pedido.filaLoja,
    });
  } catch {
    return res.status(404).json({ erro: "Pedido não encontrado" });
  }
}
