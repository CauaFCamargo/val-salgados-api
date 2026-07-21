import { describe, it, expect } from "vitest";
import { calcularValores } from "./calculo";

describe("calcularValores", () => {
  it("soma o subtotal a partir de preço x quantidade", () => {
    const valores = calcularValores(
      [
        { quantidade: 2, precoUnitario: 8 }, // 16
        { quantidade: 1, precoUnitario: 7 }, // 7
      ],
      "RETIRADA"
    );
    expect(valores.subtotal).toBe(23);
    expect(valores.total).toBe(23);
  });

  it("não cobra entrega na ENTREGA (entrega é grátis)", () => {
    const valores = calcularValores([{ quantidade: 1, precoUnitario: 10 }], "ENTREGA");
    expect(valores.taxaEntrega).toBe(0);
    expect(valores.total).toBe(10);
  });

  it("não cobra entrega na RETIRADA", () => {
    const valores = calcularValores([{ quantidade: 1, precoUnitario: 10 }], "RETIRADA");
    expect(valores.taxaEntrega).toBe(0);
  });

  it("carrinho vazio resulta em zero", () => {
    const valores = calcularValores([], "RETIRADA");
    expect(valores.subtotal).toBe(0);
    expect(valores.total).toBe(0);
  });
});
