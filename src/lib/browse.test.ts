import { describe, expect, it } from "vitest";
import { buildBrowseHref, formatPrice, isUuid, parseBrowseFilters, toSearchPattern } from "./browse";

describe("parseBrowseFilters", () => {
  it("reads a valid category and trims the query", () => {
    expect(parseBrowseFilters({ category: "books", q: "  novel " })).toEqual({
      category: "books",
      query: "novel",
    });
  });

  it("ignores an unknown category and missing values", () => {
    expect(parseBrowseFilters({ category: "nope" })).toEqual({ category: null, query: "" });
  });

  it("uses the first value when a parameter repeats", () => {
    expect(parseBrowseFilters({ q: ["bike", "car"] }).query).toBe("bike");
  });
});

describe("buildBrowseHref", () => {
  it("returns the home page when there are no filters", () => {
    expect(buildBrowseHref({ category: null, query: "" })).toBe("/");
  });

  it("keeps the category and the encoded query", () => {
    expect(buildBrowseHref({ category: "electronics", query: "usb c" })).toBe(
      "/?category=electronics&q=usb+c",
    );
  });
});

describe("toSearchPattern", () => {
  it("wraps the term in wildcards", () => {
    expect(toSearchPattern("bike")).toBe("%bike%");
  });

  it("drops characters that would change the filter", () => {
    expect(toSearchPattern("50% off, (new)")).toBe("%50 off new%");
  });

  it("returns null when nothing is left to search", () => {
    expect(toSearchPattern("  %,_ ")).toBeNull();
  });
});

describe("formatPrice", () => {
  it("shows free items, whole dollars and cents", () => {
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(1200)).toBe("$1,200");
    expect(formatPrice(19.5)).toBe("$19.50");
  });
});

describe("isUuid", () => {
  it("accepts a UUID and rejects anything else", () => {
    expect(isUuid("a0eccaa9-77ed-4b59-8171-13dc5b3bc5c1")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
  });
});
