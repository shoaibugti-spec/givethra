import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { synchronizeCompletedCase } from "./worker.js";

const workerSource = readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("completed help lifecycle", () => {
  it("marks a fully paid direct-help case completed and uses the verified total idempotently", async () => {
    const first = {
      first: vi.fn().mockResolvedValue({
        case_id: "case-1",
        paid_to: "institute",
        status: "completed",
        admin_confirmed: 1,
      }),
      bind: vi.fn(),
    };
    first.bind.mockReturnValue(first);

    const second = {
      first: vi.fn().mockResolvedValue({
        amount_needed: 22000,
        amount_collected: 0,
        verified_total: 22000,
      }),
      bind: vi.fn(),
    };
    second.bind.mockReturnValue(second);

    const update = {
      run: vi.fn().mockResolvedValue({ success: true }),
      bind: vi.fn(),
    };
    update.bind.mockReturnValue(update);

    const prepare = vi.fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(update);

    const result = await synchronizeCompletedCase({ DB: { prepare } }, "resolution-1");

    expect(result).toEqual({ case_id: "case-1", amount_collected: 22000, status: "completed" });
    expect(prepare).toHaveBeenNthCalledWith(1, expect.stringContaining("FROM case_resolutions"));
    expect(prepare).toHaveBeenNthCalledWith(2, expect.stringContaining("verified_total"));
    expect(prepare).toHaveBeenNthCalledWith(3, "UPDATE case_submissions SET amount_collected = ?, status = ? WHERE id = ?");
    expect(update.bind).toHaveBeenCalledWith(22000, "completed", "case-1");
    expect(update.run).toHaveBeenCalledOnce();
  });

  it("synchronizes case completion from the Admin resolution update route", () => {
    expect(workerSource).toContain('if (parts[2] === "resolutions" && recordId)');
    expect(workerSource).toContain('await synchronizeCompletedCase(env, recordId);');
    expect(workerSource).toContain('String(updated.status || "").toLowerCase() === "completed"');
  });

  it("does not touch the case when the resolution is not admin-confirmed", async () => {
    const prepare = vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn().mockResolvedValue({
          case_id: "case-2",
          paid_to: "institute",
          status: "pending_confirmation",
          admin_confirmed: 0,
        }),
      })),
    }));

    await expect(synchronizeCompletedCase({ DB: { prepare } }, "resolution-2")).resolves.toBeNull();
    expect(prepare).toHaveBeenCalledOnce();
  });
});
