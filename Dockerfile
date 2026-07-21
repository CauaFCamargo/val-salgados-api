# --- Etapa 1: build ---------------------------------------------------------
# Instala TODAS as deps, gera o Prisma Client e compila o TypeScript pra dist/.
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# generate não conecta no banco, mas lê a variável — passamos uma de mentira.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npx prisma generate
RUN npm run build

# --- Etapa 2: runtime -------------------------------------------------------
# Imagem final enxuta: só deps de produção + o código já compilado.
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
