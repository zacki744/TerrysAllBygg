import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS, mergeSettings, toApiSettings, paragraphs, trustItems, reviewsUrl, heroSmallUrl,
} from "./settings";

describe("mergeSettings", () => {
  it("använder standardvärden för null, tomma och saknade fält", () => {
    const s = mergeSettings({ heroTitle: null, heroLead: "   ", address: "Storgatan 1" });
    expect(s.heroTitle).toBe(DEFAULT_SETTINGS.heroTitle);
    expect(s.heroLead).toBe(DEFAULT_SETTINGS.heroLead);
    expect(s.address).toBe("Storgatan 1");
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("ignorerar värden av fel typ", () => {
    const s = mergeSettings({ trustRot: "ja" as unknown as boolean });
    expect(s.trustRot).toBe(false);
  });
});

describe("toApiSettings", () => {
  it("skickar oförändrade standardtexter som null", () => {
    const api = toApiSettings({ ...DEFAULT_SETTINGS, heroLead: "Egen text", trustFTax: true });
    expect(api.heroTitle).toBeNull();
    expect(api.heroLead).toBe("Egen text");
    expect(api.trustFTax).toBe(true);
    expect(mergeSettings(api)).toEqual({ ...DEFAULT_SETTINGS, heroLead: "Egen text", trustFTax: true });
  });
});

describe("hjälpare", () => {
  it("delar text i stycken vid tomma rader", () => {
    expect(paragraphs("Ett\nfortsätter\n\n  Två  \n\n\n")).toEqual(["Ett\nfortsätter", "Två"]);
  });

  it("visar bara förtroendepunkter som är ikryssade", () => {
    expect(trustItems(DEFAULT_SETTINGS)).not.toContain("Godkänd för F-skatt");
    expect(trustItems({ ...DEFAULT_SETTINGS, trustFTax: true })).toContain("Godkänd för F-skatt");
  });

  it("omdömen kräver både påslaget läge och en länk", () => {
    expect(reviewsUrl({ ...DEFAULT_SETTINGS, showReviews: true })).toBeNull();
    expect(reviewsUrl({ ...DEFAULT_SETTINGS, googleReviewsUrl: "https://g.page/r/x" })).toBeNull();
    expect(reviewsUrl({ ...DEFAULT_SETTINGS, showReviews: true, googleReviewsUrl: "https://g.page/r/x" }))
      .toBe("https://g.page/r/x");
  });

  it("hittar den mindre hero-bilden", () => {
    expect(heroSmallUrl("/uploads/site/hero-abc.webp")).toBe("/uploads/site/hero-abc-960.webp");
  });
});

describe("tjänster i inställningarna", () => {
  it("använder standardlistan tills Terry sparat egna", () => {
    expect(mergeSettings({ services: null }).services).toEqual(DEFAULT_SETTINGS.services);
    expect(toApiSettings(DEFAULT_SETTINGS).services).toBeNull();
  });

  it("tar emot sparade tjänster och hoppar över trasiga", () => {
    const s = mergeSettings({
      services: [
        { slug: "pooler", name: "Pooler", intro: "Vi bygger pooler.", includes: ["Trädäck runt poolen"] },
        { slug: "", name: "Utan adress" },
        "skräp",
      ] as never,
    });
    expect(s.services.map((x) => x.slug)).toEqual(["pooler"]);
    expect(s.services[0].title).toBe("Pooler");        // rubrik saknas → namnet
    expect(s.services[0].goodToKnow).toBe("");
  });

  it("skickar ändrade tjänster till servern", () => {
    const services = DEFAULT_SETTINGS.services.slice(0, 2);
    expect(toApiSettings({ ...DEFAULT_SETTINGS, services }).services).toEqual(services);
  });
});
