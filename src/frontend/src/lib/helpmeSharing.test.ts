import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { buildHelpMeShareUrl } from "./helpme";

const root = process.cwd();
const workerFile = ["worker.js", "worker (5).js"].find((file) => fs.existsSync(path.join(root, file)));
if (!workerFile) throw new Error("Could not locate the Help Me Worker source");
const workerSource = fs.readFileSync(path.join(root, workerFile), "utf8");
const helpMeSource = fs.readFileSync(path.join(root, "src/pages/HelpMePage.tsx"), "utf8");
const uploadSource = fs.readFileSync(path.join(root, "helpme.js"), "utf8");

describe("Help Me audio and social sharing", () => {
  it("creates the public crawler-preview URL for the appeal", () => {
    expect(buildHelpMeShareUrl("appeal_123", "https://givethra.org")).toBe("https://givethra.org/share/helpme/appeal_123?preview=2");
  });

  it("provides public-only thumbnail and video metadata for social crawlers", () => {
    expect(workerSource).toContain('parts[1] === "helpme"');
    expect(workerSource).toContain("function helpMeShareDocument");
    expect(workerSource).toContain('"og:image"');
    expect(workerSource).toContain('"og:video:secure_url"');
    expect(workerSource).toContain("isSocialCrawler(request)");
    expect(workerSource).toContain("/helpme?v=${encodeURIComponent(appealId)}");
    expect(workerSource).toContain('pageUrl.searchParams.set("preview", "2")');
    expect(workerSource).toContain('"summary_large_image"');
    expect(workerSource).toContain('request.method === "HEAD"');
    expect(uploadSource).toContain('method === "HEAD"');
    expect(uploadSource).toContain('status IN (\'published\',\'helped\')');
  });

  it("starts sound on and leaves the manual mute toggle in place", () => {
    expect(helpMeSource).toContain("const [muted, setMuted] = useState(false)");
    expect(helpMeSource).toContain('onClick={() => setMuted((m) => !m)}');
    expect(helpMeSource).toContain('aria-label={muted ? "Unmute" : "Mute"}');
  });

  it("keeps poster uploads staged until approval and removes them with the video", () => {
    expect(uploadSource).toContain('sub === "upload-thumbnail"');
    expect(uploadSource).toContain('pending/${uploadId}.jpg');
    expect(uploadSource).toContain('thumbs/${a.id}.jpg');
    expect(uploadSource).toContain('sub === "thumbnail"');
  });
});
