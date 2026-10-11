import { describe, expect, it } from "vitest";
import { DEFAULT_SERVICES, findService, projectsForService, suggestService, validateServices } from "./services";
import { slugify } from "./routes";

describe("standardtjänsterna", () => {
  it("har unika, URL-säkra adresser", () => {
    const slugs = DEFAULT_SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slugify(slug)).toBe(slug));
    expect(validateServices(DEFAULT_SERVICES)).toBeNull();
  });

  it("har texter som får plats i Googles resultat", () => {
    DEFAULT_SERVICES.forEach((s) => {
      expect(s.description.length, s.slug).toBeGreaterThan(80);
      expect(s.description.length, s.slug).toBeLessThanOrEqual(165);
    });
  });
});

describe("etiketter på projekt", () => {
  it("visar bara projekt med tjänstens etikett", () => {
    const projects = [
      { title: "Däck", service: "altaner" },
      { title: "Golv", service: "renovering" },
      { title: "Lite blandat", service: null },
    ];
    expect(projectsForService(findService(DEFAULT_SERVICES, "altaner")!, projects).map((p) => p.title)).toEqual(["Däck"]);
    expect(findService(DEFAULT_SERVICES, "finns-inte")).toBeUndefined();
    expect(findService(DEFAULT_SERVICES, null)).toBeUndefined();
  });
});

describe("förslag på tjänst i admin", () => {
  // Dagens titlar i databasen — alla utom "Lite blandat" ska få ett förslag
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
  ])("%s → %s", (title, slug) => {
    expect(suggestService(DEFAULT_SERVICES, title)?.slug).toBe(slug);
  });

  it("föreslår inget för Lite blandat, och \"tak\" räknas bara som eget ord", () => {
    expect(suggestService(DEFAULT_SERVICES, "Lite blandat")).toBeUndefined();
    expect(suggestService(DEFAULT_SERVICES, "Altan med skärmtak")?.slug).toBe("altaner");
  });

  it("hittar även tjänster som Terry själv lagt till, via namnet", () => {
    const own = [...DEFAULT_SERVICES, { ...DEFAULT_SERVICES[0], slug: "pooler", name: "Pooler" }];
    expect(suggestService(own, "Pool i trädgården")?.slug).toBe("pooler");
  });
});

describe("validering i admin", () => {
  it("stoppar tomma namn, ogiltiga och dubbla adresser", () => {
    expect(validateServices([{ name: "", slug: "a" }])).toMatch(/namn/);
    expect(validateServices([{ name: "Förråd", slug: "Förråd" }])).toMatch(/a–z/);
    expect(validateServices([{ name: "A", slug: "x" }, { name: "B", slug: "x" }])).toMatch(/samma adress/);
  });
});
