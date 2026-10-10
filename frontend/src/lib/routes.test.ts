import { describe, expect, it } from "vitest";
import { projectPath, slugify, snickeriPath } from "./routes";

describe("slugify", () => {
  it("gör om svenska tecken och mellanslag", () => {
    expect(slugify("Utomhusbastu i lärk")).toBe("utomhusbastu-i-lark");
    expect(slugify("Förråd & Garage")).toBe("forrad-garage");
    expect(slugify("Ölands Café")).toBe("olands-cafe");
  });

  it("tar bort bindestreck i början och slutet", () => {
    expect(slugify("  --Bänk i ek!--  ")).toBe("bank-i-ek");
  });

  it("kortar långa titlar till 60 tecken", () => {
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });
});

describe("detaljsökvägar", () => {
  it("bygger /projekt/<id>/<slug>", () => {
    expect(projectPath("123", "Altan med pergola")).toBe("/projekt/123/altan-med-pergola");
  });

  it("utelämnar slug när titel saknas", () => {
    expect(snickeriPath("abc")).toBe("/snickerier/abc");
  });
});
