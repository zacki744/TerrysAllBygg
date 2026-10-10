import { describe, expect, it } from "vitest";
import { clampDescription } from "./meta";

describe("clampDescription", () => {
  it("lämnar korta texter oförändrade men städar blanksteg", () => {
    expect(clampDescription("  Bastu \n på   Österlen ")).toBe("Bastu på Österlen");
  });

  it("kortar vid ordgräns och lägger till …", () => {
    const text = "Ord ".repeat(60);
    const result = clampDescription(text);
    expect(result.length).toBeLessThanOrEqual(158);
    expect(result.endsWith("Ord…")).toBe(true);
  });
});
