import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const video = readFileSync(new URL("./steps/StepVideo.tsx", import.meta.url), "utf8");
const constants = readFileSync(new URL("./constants.ts", import.meta.url), "utf8");
const categoryStep = readFileSync(new URL("./steps/StepCategoryDetails.tsx", import.meta.url), "utf8");
const validation = readFileSync(new URL("./utils/validation.ts", import.meta.url), "utf8");
const constantsSource = readFileSync(new URL("./constants.ts", import.meta.url), "utf8");
const amountStep = readFileSync(new URL("./steps/StepAmount.tsx", import.meta.url), "utf8");
const submitCase = readFileSync(new URL("./utils/SubmitCase.ts", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../../worker.js", import.meta.url), "utf8");

describe("Requester Visit submission audit", () => {
  it("uses medium 480p capture and bounded bitrate/size", () => {
    expect(video).toContain("const VIDEO_WIDTH = 854;");
    expect(video).toContain("const VIDEO_HEIGHT = 480;");
    expect(video).toContain("const VIDEO_BITRATE = 900_000;");
    expect(video).toContain("const AUDIO_BITRATE = 64_000;");
    expect(video).toContain("const MAX_VIDEO_BYTES = 20 * 1024 * 1024;");
    expect(video).toContain("max: VIDEO_WIDTH");
    expect(video).toContain("max: VIDEO_HEIGHT");
  });

  it("keeps every public category represented by a dedicated form", () => {
    const categories = [...constants.matchAll(/^  "([^"]+)"[,\s]*$/gm)].map((match) => match[1]);
    for (const category of categories) {
      if (category === "PKR" || category === "USD") continue;
      expect(categoryStep).toContain(`"${category}":`);
    }
    expect(categoryStep).toContain("const CATEGORY_FORM_MAP");
    expect(categoryStep).toContain("const FormComponent = CATEGORY_FORM_MAP[category]");
  });

  it("keeps required category validation in the same nested catFields/catDocUrls shape", () => {
    expect(validation).toContain("const fields = formData.catFields || {};");
    expect(validation).toContain("const docs = formData.catDocUrls || {};");
    expect(validation).toContain('"Medical & Treatment"');
    expect(validation).toContain('"Child Support"');
    expect(validation).toContain('"Emergency Help"');
  });

  it("uses fixed Rs 3,000 Emergency and Rs 8,000 Livestock/Farming amounts everywhere", () => {
    expect(constantsSource).toContain('"Emergency Help": { type: "fixed", amount: 3000');
    expect(constantsSource).toContain('"Livestock / Farming": { type: "fixed", amount: 8000');
    expect(amountStep).toContain("const fixedAmount = getFixedAmount(category);");
    expect(amountStep).toContain("readOnly={isFixed}");
    expect(submitCase).toContain("const fixedAmount = getFixedAmount(category);");
    expect(worker).toContain('if (category === "Emergency Help") return 3000;');
    expect(worker).toContain('if (category === "Livestock / Farming") return 8000;');
  });
});
