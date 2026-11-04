import { describe, expect, it } from "vitest";
import { isValidHelpMeAccountIdentifier } from "./helpme";

describe("Help Me payment details", () => {
  it("accepts common international account identifiers without accepting arbitrary punctuation", () => {
    expect(isValidHelpMeAccountIdentifier("GB82 WEST 1234")).toBe(true);
    expect(isValidHelpMeAccountIdentifier("hero@example.com")).toBe(true);
    expect(isValidHelpMeAccountIdentifier("wallet-12345")).toBe(true);
    expect(isValidHelpMeAccountIdentifier("bad!identifier")).toBe(false);
  });
});
