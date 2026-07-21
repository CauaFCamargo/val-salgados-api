// -----------------------------------------------------------------------------
// Configuração de autenticação do dashboard da Val.
//
// Por que credenciais em variáveis de ambiente (e não numa tabela de usuários)?
// Porque só existe UMA pessoa que acessa o painel (a Val). Criar tabela, hash de
// senha e cadastro seria complexidade sem retorno. Se um dia houver vários
// usuários, aí sim vale uma tabela `Usuario` com senha "hasheada" (bcrypt).
//
// Os valores vêm do .env (fora do Git). Os "?? ..." são só defaults de
// desenvolvimento pra não travar caso a variável falte.
// -----------------------------------------------------------------------------

export const AUTH = {
  usuario: process.env.ADMIN_USER ?? "val",
  senha: process.env.ADMIN_PASSWORD ?? "val123",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-troque-em-producao",
  // Quanto tempo o token vale antes de expirar (a Val precisa logar de novo).
  expiraEm: "8h",
} as const;
