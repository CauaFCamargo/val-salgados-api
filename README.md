# Val Salgados — API

Backend do cardápio e dos pedidos da Val Salgados. O cliente monta o pedido no [front](https://github.com/CauaFCamargo/val-salgados-front); esta API grava o pedido, calcula totais, gera um link de acompanhamento e expõe a fila de impressão da loja.

Front no ar: [https://val-salgados-front.vercel.app](https://val-salgados-front.vercel.app)

## O que ela faz

- `POST /pedidos` — cria pedido (público)
- `GET /pedidos/:token` — status pelo **token aleatório**, não pelo id sequencial (evita IDOR)
- `GET /pedidos` — lista da loja (**JWT**)
- `PATCH /pedidos/:id/status` — muda status (**JWT**)
- `PATCH /pedidos/:id/impressao` — fila térmica via cliente / via loja (**JWT**)
- `POST /auth` — login da loja

Regras de dinheiro (subtotal, taxa de entrega, total) estão em funções puras em `src/services/calculo.ts`, cobertas por Vitest.

## Stack

Express 5 · TypeScript · Prisma · PostgreSQL · JWT · Zod · Vitest · CORS

## Como rodar

```bash
git clone https://github.com/CauaFCamargo/val-salgados-api.git
cd val-salgados-api
cp .env.example .env   # se o arquivo existir; senão crie DATABASE_URL, JWT_SECRET e CORS_ORIGIN
npm install
npx prisma migrate dev
npm run dev
```

```bash
npm test          # Vitest
npm run typecheck
```

Porta: `PORT` (produção) ou `3000` (local). Em produção o CORS trava em `CORS_ORIGIN` (o front na Vercel).
