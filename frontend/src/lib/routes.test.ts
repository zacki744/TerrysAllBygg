import { describe, expect, it } from "vitest";
import {
  bookPathFor, bookingReference, projectMetaDescription, projectPageTitle, projectPath, slugify, snickeriPath,
} from "./routes";

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

describe("bokning med projektreferens", () => {
  it("bygger och läser tillbaka länken", () => {
    const url = bookPathFor("Altan & pergola");
    expect(url).toBe("/book?projekt=Altan%20%26%20pergola");
    expect(bookingReference(new URLSearchParams(url.split("?")[1]))).toBe("Altan & pergola");
  });

  it("städar referensen: en rad, max 100 tecken, tom = null", () => {
    expect(bookingReference(new URLSearchParams("projekt=%20%20Rad%0Aett%20%20"))).toBe("Rad ett");
    expect(bookingReference(new URLSearchParams(`projekt=${"a".repeat(300)}`))?.length).toBe(100);
    expect(bookingReference(new URLSearchParams("projekt=%20"))).toBeNull();
    expect(bookingReference(new URLSearchParams(""))).toBeNull();
  });
});

describe("bokning med kategori", () => {
  it("lägger till kategorin när projektet har en", () => {
    expect(bookPathFor("Altan", "altaner")).toBe("/book?projekt=Altan&kategori=altaner");
    expect(bookPathFor("Altan", null)).toBe("/book?projekt=Altan");
  });
});

describe("projektets titel och beskrivning för Google", () => {
  it("lägger till orten i titeln om den saknas", () => {
    expect(projectPageTitle("Altan med pergola", "Kivik")).toBe("Altan med pergola i Kivik");
    expect(projectPageTitle("Bastu i Kivik", "kivik")).toBe("Bastu i Kivik");
    expect(projectPageTitle("Golv", null)).toBe("Golv");
    expect(projectPageTitle("Golv", "  ")).toBe("Golv");
  });

  it("skriver en hel mening när beskrivningen är kort", () => {
    expect(projectMetaDescription("Golv", "Golv", null))
      .toBe("Golv – bilder från ett projekt av Terrys Allbygg, bygg och snickeri på Österlen.");
    expect(projectMetaDescription("Tak", "Nytt tegeltak", "Simrishamn"))
      .toBe("Nytt tegeltak. Tak i Simrishamn – bilder från ett projekt av Terrys Allbygg, bygg och snickeri på Österlen.");
  });

  it("behåller en lång beskrivning", () => {
    const long = "En altan i lärkträ på 40 kvadratmeter med inbyggd pergola, trappa ner mot gräsmattan och belysning.";
    expect(projectMetaDescription("Altan", long, "Kivik")).toBe(long);
  });
});
