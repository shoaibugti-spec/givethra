import { describe, expect, it } from "vitest";
import { getHelpMeThumbnailSize } from "./helpmeThumbnail";

describe("Help Me video thumbnails", () => {
  it("preserves a portrait frame while limiting its longest edge", () => {
    expect(getHelpMeThumbnailSize(1080, 1920)).toEqual({ width: 405, height: 720 });
  });

  it("keeps small frames at their original size", () => {
    expect(getHelpMeThumbnailSize(480, 640)).toEqual({ width: 480, height: 640 });
  });

  it("rejects unavailable dimensions instead of creating a broken image", () => {
    expect(() => getHelpMeThumbnailSize(0, 640)).toThrow("Video dimensions are unavailable");
  });
});
