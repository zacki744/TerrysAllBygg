import { describe, expect, it } from "vitest";
import { TEMPLATE, hasPlaceholders, mentionsPlace, wordCount } from "./projectText";

describe("projekttexter", () => {
  it("räknar ord", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("  Altan   i\nlärk ")).toBe(3);
  });

  it("hittar kvarlämnad mall-text", () => {
    expect(hasPlaceholders(TEMPLATE)).toBe(true);
    expect(hasPlaceholders("En altan i Kivik [2025]")).toBe(true);
    expect(hasPlaceholders("En altan i Kivik.")).toBe(false);
  });

  it("känner igen orter, men inte inuti andra ord", () => {
    expect(mentionsPlace("Altan i Simrishamn")).toBe(true);
    expect(mentionsPlace("bygget på österlen")).toBe(true);
    expect(mentionsPlace("Vi byggde en vik-vägg")).toBe(true);    // "Vik" som eget ord
    expect(mentionsPlace("Viktigt med dränering")).toBe(false); // inte "Vik" i "Viktigt"
    expect(mentionsPlace("En fin altan")).toBe(false);
  });
});
