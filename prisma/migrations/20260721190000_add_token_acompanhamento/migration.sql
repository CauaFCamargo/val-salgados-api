-- Token do link público de acompanhamento.
-- NOT NULL com DEFAULT funciona nas linhas já existentes: o Postgres preenche
-- cada uma chamando gen_random_uuid(), que é volátil e portanto gera um valor
-- diferente por linha — condição pro índice único abaixo não falhar.
ALTER TABLE "Pedido" ADD COLUMN "token" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_token_key" ON "Pedido"("token");
