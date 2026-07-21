-- Coluna opcional: os pedidos que já existem simplesmente ficam sem CEP.
ALTER TABLE "Pedido" ADD COLUMN "cep" TEXT;
