import { describe, expect, it } from "vitest";
import { formatCnicNumber, getKycOcrAssetPaths } from "./kycOcr";

describe("KYC OCR helpers", () => {
  it("builds same-origin OCR asset paths at the site root", () => {
    expect(getKycOcrAssetPaths("/")).toEqual({
      workerPath: "/ocr/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
    });
  });

  it("preserves a configured application base path", () => {
    expect(getKycOcrAssetPaths("/portal/")).toEqual({
      workerPath: "/portal/ocr/worker.min.js",
      corePath: "/portal/ocr/core",
      langPath: "/portal/ocr/lang",
    });
  });

  it("formats a valid 13-digit CNIC consistently", () => {
    expect(formatCnicNumber("1234512345671")).toBe("12345-1234567-1");
    expect(formatCnicNumber("12345-1234567-1")).toBe("12345-1234567-1");
  });

  it("does not turn invalid or incomplete input into a valid CNIC", () => {
    expect(formatCnicNumber("123451234567")).toBeNull();
    expect(formatCnicNumber("12345123456712")).toBeNull();
    expect(formatCnicNumber("12345A2345671")).toBeNull();
  });
});
