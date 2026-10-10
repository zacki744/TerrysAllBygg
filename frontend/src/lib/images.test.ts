import { describe, expect, it } from "vitest";
import { cardSrcSet, thumbUrl } from "./images";

describe("thumbUrl", () => {
  it("pekar på webp-miniatyren i thumbs/", () => {
    expect(thumbUrl("/uploads/projects/abc.jpg")).toBe("/uploads/projects/thumbs/abc.webp");
    expect(thumbUrl("/uploads/projects/abc.webp")).toBe("/uploads/projects/thumbs/abc.webp");
  });

  it("lämnar andra bilder orörda", () => {
    expect(thumbUrl("/og-image.jpg")).toBe("/og-image.jpg");
    expect(thumbUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  });
});

describe("cardSrcSet", () => {
  it("listar miniatyr och fullstorlek", () => {
    expect(cardSrcSet("/uploads/projects/abc.jpg"))
      .toBe("/uploads/projects/thumbs/abc.webp 640w, /uploads/projects/abc.jpg 1600w");
  });

  it("ger ingen srcset för bilder utan miniatyr", () => {
    expect(cardSrcSet("/placeholder.jpg")).toBeUndefined();
  });
});
