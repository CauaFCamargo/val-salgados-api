-- Impressão vira MANUAL: o pedido não entra mais na fila ao ser criado.
-- O padrão de `impresso` passa a ser true ("fora da fila"); a Val põe false
-- clicando "Imprimir" no painel, o agente imprime e volta pra true.
ALTER TABLE "Pedido" ALTER COLUMN "impresso" SET DEFAULT true;

-- Zera a fila atual: evita que, ao ligar o agente, tudo que estava pendente
-- (impresso=false) seja impresso de uma vez.
UPDATE "Pedido" SET impresso = true WHERE impresso = false;
