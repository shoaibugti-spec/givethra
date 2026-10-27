import { describe, expect, it } from "vitest";
import { buildAffidavit } from "./affidavit";

const completedCase = {
  id: "case-1",
  user_id: "seeker-1",
  title: "Surgery",
  category: "Medical",
  currency: "PKR",
  status: "completed",
};

const contribution = (id: string, heroId: string, amount: number, extra: any = {}) => ({
  id,
  hero_id: heroId,
  hero_name: `Hero ${heroId}`,
  seeker_name: "Ali Khan",
  status: "completed",
  paid_to: "givethra",
  case_contribution_amount: amount,
  transaction_id: `TX-${id}`,
  ...extra,
});

describe("buildAffidavit", () => {
  it("gives a contributing hero only their own contribution", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: completedCase,
      resolutions: [contribution("r1", "h1", 500), contribution("r2", "h2", 700)],
      unlocks: [],
      user: { id: "h1", fullName: "Hero h1" },
      role: "hero",
    });
    expect(doc?.entries).toHaveLength(1);
    expect(doc?.entries[0].kind).toBe("contribution");
    expect(doc?.totalAmount).toBe(500);
  });

  it("gives the requester every verified contribution with a total", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: completedCase,
      resolutions: [contribution("r1", "h1", 500), contribution("r2", "h2", 700)],
      unlocks: [],
      user: { id: "seeker-1", fullName: "Ali Khan" },
      role: "seeker",
    });
    expect(doc?.entries).toHaveLength(2);
    expect(doc?.totalAmount).toBe(1200);
  });

  it("does not count another helper's unverified or rejected payment for the requester", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: { ...completedCase, status: "approved" },
      resolutions: [
        contribution("r1", "h1", 500),
        contribution("r2", "h2", 700, { status: "pending" }),
        contribution("r3", "h3", 900, { status: "rejected" }),
      ],
      unlocks: [],
      user: { id: "seeker-1" },
      role: "seeker",
    });
    expect(doc?.entries).toHaveLength(1);
    expect(doc?.totalAmount).toBe(500);
  });

  it("never gives a hero an affidavit from a rejected payment", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: completedCase,
      resolutions: [contribution("r1", "h1", 500, { status: "rejected", case_status: "completed" })],
      unlocks: [],
      user: { id: "h1" },
      role: "hero",
    });
    expect(doc).toBeNull();
  });

  it("does not give an unlock-only hero an affidavit", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: completedCase,
      resolutions: [],
      unlocks: [{ case_id: "case-1", hero_id: "h1", payment_type: "partial" }],
      user: { id: "h1" },
      role: "hero",
    });
    expect(doc).toBeNull();
  });

  it("builds a direct-help affidavit from admin evidence on the case", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: { ...completedCase, reference_number: "REF9", amount_collected: 4000 },
      resolutions: [],
      unlocks: [{ case_id: "case-1", hero_id: "h1", payment_type: "full" }],
      user: { id: "h1", fullName: "Hero One" },
      role: "hero",
    });
    expect(doc?.entries[0].kind).toBe("direct");
    expect(doc?.entries[0].transactionId).toBe("REF9");
    expect(doc?.totalAmount).toBe(4000);
  });

  it("gives the requester a direct-help affidavit when admin recorded the payment", () => {
    const doc = buildAffidavit({
      caseId: "case-1",
      caseData: { ...completedCase, reference_number: "REF9", amount_collected: 4000 },
      resolutions: [],
      unlocks: [],
      user: { id: "seeker-1" },
      role: "seeker",
    });
    expect(doc?.role).toBe("seeker");
    expect(doc?.totalAmount).toBe(4000);
  });
});
