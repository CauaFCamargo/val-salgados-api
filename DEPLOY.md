# Deploy — Val Salgados (Neon + Render + Vercel)

Ordem importa: **Neon → Render → Vercel → volta na API**. Cada passo entrega uma
informação que o próximo precisa.

Pré-requisito: os 3 projetos precisam estar no **GitHub** (Render e Vercel fazem
deploy a partir de um repositório).

---

## 1. Banco — Neon (Postgres)

1. Crie um projeto em https://neon.tech (plano free).
2. Copie a **connection string** (algo como
   `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`). Ela é a `DATABASE_URL`.
3. Aplique as migrations no banco novo, rodando **da sua máquina** (a pasta `val-salgados-api`):

   ```bash
   DATABASE_URL="cole-a-string-do-neon-aqui" npx prisma migrate deploy
   ```

   `migrate deploy` só aplica migrations já criadas — é o comando de produção.
   Repita esse comando sempre que criar uma migration nova.

---

## 2. API — Render (Docker)

1. Em https://render.com → **New +** → **Blueprint** e aponte pro repo `val-salgados-api`.
   O Render lê o `render.yaml` e já entende que é um serviço Docker.
2. Preencha as variáveis de ambiente (o `render.yaml` lista elas com `sync: false`):
   - `DATABASE_URL` → a string do Neon (passo 1).
   - `JWT_SECRET` → uma string longa e aleatória.
   - `ADMIN_USER` / `ADMIN_PASSWORD` → login do painel (use algo forte!).
   - `PIX_KEY`, `WHATSAPP_NUMERO` → dados da empresa (pode deixar pra depois).
   - `APP_URL`, `CORS_ORIGIN` → **deixe em branco por enquanto** (dependem do Vercel).
3. Deploy. Quando terminar, copie a URL pública (ex.: `https://val-salgados-api.onrender.com`).
4. Teste: abra essa URL no navegador — deve responder `{"message":"API Val Salgados no ar!"}`.

> Observação: no plano free, o serviço "dorme" após um tempo sem uso e leva alguns
> segundos pra acordar na primeira chamada. Normal.

---

## 3. Front — Vercel

1. Em https://vercel.com → **Add New** → **Project** e importe o repo `val-salgados-front`.
   O Vercel detecta Vite sozinho (build `npm run build`, saída `dist`).
2. Em **Environment Variables**, adicione:
   - `VITE_API_URL` → a URL da API no Render (passo 2).
3. Deploy. Copie a URL do site (ex.: `https://val-salgados.vercel.app`).

O `vercel.json` já cuida do "SPA fallback" — links diretos como `/pedido/6` e
`/admin` funcionam ao recarregar.

---

## 4. Fechar o círculo (na API, no Render)

Agora que o front tem URL, volte no Render e preencha:
- `APP_URL` → a URL do Vercel (usada no link "Acompanhe" da mensagem do WhatsApp).
- `CORS_ORIGIN` → a mesma URL do Vercel (restringe quem pode chamar a API).

Salve — o Render redeploya sozinho. Pronto: front, API e banco conversando em produção.

---

## 5. Impressão (fica na loja, não na nuvem)

O agente `val-salgados-impressao` roda na máquina da loja. No `.env` dele, aponte
`API_URL` pra URL do Render e use as credenciais do painel. Veja o `README.md` dele.
