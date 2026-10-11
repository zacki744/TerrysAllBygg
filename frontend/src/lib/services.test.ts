import { describe, expect, it } from "vitest";
import { SERVICES, findService, projectsForService, serviceForProject } from "./services";
import { slugify } from "./routes";

const BOOK_TYPES = ["altan", "garage", "friggebod", "pool", "bastu", "tillbyggnad", "forrad", "studio", "renovering", "annat"];

describe("tjänster", () => {
  it("har unika, URL-säkra slugs", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach((slug) => expect(slugify(slug)).toBe(slug));
  });

  it("har meta-beskrivningar som får plats i Googles resultat", () => {
    SERVICES.forEach((s) => {
      expect(s.description.length, s.slug).toBeGreaterThan(80);
      expect(s.description.length, s.slug).toBeLessThanOrEqual(165);
    });
  });

  it("länkar bara till projekttyper som finns i bokningsformuläret", () => {
    SERVICES.forEach((s) => expect(BOOK_TYPES, s.slug).toContain(s.bookType));
  });

  it("kopplar projekt till rätt tjänst – titeln väger tyngst", () => {
    expect(serviceForProject("Altan med pergola")?.slug).toBe("altaner");
    expect(serviceForProject("Utomhusbastu i lärk")?.slug).toBe("bastu");
    expect(serviceForProject("Bastu med altan")?.slug).toBe("bastu");
    expect(serviceForProject("Projekt i Kivik", "Ett nytt förråd med sedumtak")?.slug).toBe("forrad-och-garage");
    expect(serviceForProject("Sommarprojekt", "Inget särskilt")).toBeUndefined();
  });

  it("hittar exempelprojekt för en tjänst", () => {
    const projects = [
      { title: "Altan med pergola", description: "" },
      { title: "Gästhus", description: "Med liten altan" },
      { title: "Bastu", description: "" },
    ];
    expect(projectsForService(findService("altaner")!, projects).map((p) => p.title))
      .toEqual(["Altan med pergola", "Gästhus"]);
    expect(findService("finns-inte")).toBeUndefined();
  });
});
