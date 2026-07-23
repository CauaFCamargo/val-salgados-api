-- Impressão manual POR VIA: troca o booleano único `impresso` por duas filas,
-- uma pra via do cliente e outra pra via da loja.
ALTER TABLE "Pedido" ADD COLUMN "filaCliente" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Pedido" ADD COLUMN "filaLoja" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Pedido" DROP COLUMN "impresso";
