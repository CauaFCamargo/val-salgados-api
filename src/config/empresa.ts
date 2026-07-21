// -----------------------------------------------------------------------------
// Dados FIXOS da empresa. Não mudam de pedido pra pedido, então não entram na
// tabela `Pedido` — ficam aqui, num único lugar fácil de editar.
// (A spec pede exatamente isso: chave PIX, nome, horário em config fixa.)
// -----------------------------------------------------------------------------

// Os valores abaixo têm um padrão de desenvolvimento, mas podem ser
// sobrescritos por variáveis de ambiente em produção (ex.: no Render) — assim
// você configura sem mexer no código.
export const EMPRESA = {
  nome: "Val Salgados",
  // Chave PIX real da empresa (defina PIX_KEY no ambiente de produção).
  chavePix: process.env.PIX_KEY ?? "SUA_CHAVE_PIX_AQUI",
  // Número do WhatsApp que RECEBE os pedidos, formato internacional só com
  // dígitos (ex.: "5515999998888"). Defina WHATSAPP_NUMERO em produção.
  whatsapp: process.env.WHATSAPP_NUMERO ?? "5515999998888",
  horario: "Seg à Sáb - 08:00 as 18:00",
  // Endereço da loja, mostrado na mensagem quando o pedido é RETIRADA.
  endereco: "Alameda Celidônio do Monte, 757 · Sorocaba - SP",
  // URL pública do front, usada no link "acompanhe seu pedido".
  // Em produção, defina APP_URL com a URL do Vercel.
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
} as const;

// A Val NÃO cobra pela entrega — o delivery é grátis. Por isso a taxa é sempre 0.
// Mantemos o campo no banco caso um dia isso mude, mas hoje a regra é: grátis.
export const TAXA_ENTREGA = 0;
