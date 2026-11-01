import { describe, expect, it } from "vitest";
import { DREAM_PRODUCT_IMAGE_FALLBACK, resolveDreamProductImage } from "./dreamProductImage";

describe("Dream product image URLs", () => {
  it("routes apex-hosted uploaded product photos through the www media host", () => {
    expect(resolveDreamProductImage("https://givethra.org/uploads/dreams/item.jpg", "https://www.givethra.org"))
      .toBe("https://www.givethra.org/uploads/dreams/item.jpg");
  });

  it("keeps query strings and upload-key paths intact while switching the host", () => {
    expect(resolveDreamProductImage("https://givethra.org/uploads/dreams/item.webp?v=3", "https://givethra.org"))
      .toBe("https://www.givethra.org/uploads/dreams/item.webp?v=3");
    expect(resolveDreamProductImage("https://givethra.org/uploads?key=dreams%2Fitem.png", "https://www.givethra.org"))
      .toBe("https://www.givethra.org/uploads/dreams/item.png");
  });

  it("leaves third-party images unchanged and returns the project placeholder for empty values", () => {
    expect(resolveDreamProductImage("https://images.example.com/item.jpg", "https://www.givethra.org"))
      .toBe("https://images.example.com/item.jpg");
    expect(resolveDreamProductImage(null, "https://www.givethra.org")).toBe(DREAM_PRODUCT_IMAGE_FALLBACK);
  });
});
