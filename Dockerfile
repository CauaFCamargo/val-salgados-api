# --- Etapa 1: build ---------------------------------------------------------
# Instala TODAS as deps, gera o Prisma Client e compila o TypeScript pra dist/.
FROM node:22-slim AS build
WORKDIR /app

# O motor de migrations do Prisma (binário Rust) depende do OpenSSL, que não
# vem na imagem slim. Sem isso o Prisma reclama e pode falhar.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
# generate não conecta no banco, mas lê a variável — passamos uma de mentira.
# (o `npm run build` já roda `prisma generate` antes do tsc.)
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm run build

# --- Etapa 2: runtime -------------------------------------------------------
# Imagem final enxuta: só deps de produção + o código já compilado.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL também é necessário aqui: é neste estágio que roda o `migrate deploy`.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
# schema + migrations + config são necessários para rodar `prisma migrate deploy`
# na inicialização do container (o `dist` sozinho não tem esses arquivos).
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

EXPOSE 3000
# Aplica as migrations pendentes no banco (Neon) e só então sobe o servidor.
# `migrate deploy` é idempotente: se não há nada pendente, é um no-op rápido.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
