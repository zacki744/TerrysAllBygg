import { describe, expect, it } from "vitest";
import { DEFAULT_CATEGORIES, categoryPath, findCategory, suggestCategory, validateCategories } from "./categories";

const suggest = (title: string, description = "") => suggestCategory(DEFAULT_CATEGORIES, title, description)?.slug;

describe("kategoriförslag", () => {
  // Titlarna som ligger på sajten i dag
  it.each([
    ["Däck", "altaner"],
    ["Förråd o dyl", "forrad-och-garage"],
    ["Grindar", "snickerier"],
    ["Staket mm", "snickerier"],
    ["Utemöbler", "snickerier"],
    ["Utedusch med planteringsbord", "snickerier"],
    ["Fönster o dörrar", "renovering"],
    ["Golv", "renovering"],
    ["Tak", "renovering"],
    ["Målning", "renovering"],
    ["Reperationer och Renoveringar", "renovering"],
    ["Bastu vid havet", "bastu"],
  ])("%s → %s", (title, slug) => {
    expect(suggest(title)).toBe(slug);
  });

  it("föreslår inget när titeln inte säger något", () => {
    expect(suggest("Lite blandat")).toBeUndefined();
  });

  it("titeln går före beskrivningen", () => {
    expect(suggest("Ny altan", "Vi renoverade även förrådet")).toBe("altaner");
    expect(suggest("Sommarens jobb", "En friggebod i trä")).toBe("forrad-och-garage");
  });

  it("matchar egna kategorier på namnet", () => {
    const own = [{ slug: "pooler", name: "Pooler", detail: "" }];
    expect(suggestCategory(own, "Pool med trädäck")?.slug).toBe("pooler");
  });

  it("en kategori utan namn matchar inte allt", () => {
    expect(suggestCategory([{ slug: "x", name: "", detail: "" }], "Golv")).toBeUndefined();
  });
});

describe("kategorier", () => {
  it("hittar på adress", () => {
    expect(findCategory(DEFAULT_CATEGORIES, "bastu")?.name).toBe("Bastuer");
    expect(findCategory(DEFAULT_CATEGORIES, "slott")).toBeUndefined();
    expect(findCategory(DEFAULT_CATEGORIES, null)).toBeUndefined();
    expect(categoryPath("altaner")).toBe("/projekt?kategori=altaner");
  });

  it("standardlistan är giltig", () => {
    expect(validateCategories(DEFAULT_CATEGORIES)).toBeNull();
  });

  it("stoppar tomma namn, felaktiga och dubbla adresser", () => {
    expect(validateCategories([{ name: " ", slug: "a" }])).toMatch(/namn/);
    expect(validateCategories([{ name: "Tak", slug: "Tak!" }])).toMatch(/a–z/);
    expect(validateCategories([{ name: "Tak", slug: "tak" }, { name: "Tak 2", slug: "tak" }])).toMatch(/samma adress/);
  });
});
