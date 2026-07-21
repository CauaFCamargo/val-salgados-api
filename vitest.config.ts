import { defineConfig } from "vitest/config";

// Sem esta config, o Vitest varre o projeto inteiro e acaba pegando os testes
// JÁ COMPILADOS em dist/ (gerados pelo `npm run build`). Eles são CommonJS e o
// Vitest não consegue importá-los, então `npm test` falhava sempre que alguém
// tivesse rodado o build antes — inclusive no CI.
export default defineConfig({
  test: {
    // Só os testes do código-fonte.
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
  },
});
