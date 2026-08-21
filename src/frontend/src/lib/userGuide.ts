// src/frontend/src/lib/userGuide.ts
// Replaces Supabase calls with Cloudflare Worker API calls

import { sendGuideOnce } from "@/lib/notify";
import {
  getKycStatus,
  getProfile,
  getWallet,
  getCaseCount,
  getHelpCount,
} from "@/lib/api";

/**
 * Runs when a user opens the app.
 * Checks the user's status and sends appropriate guide notifications.
 * Each guide is sent only once per user (sendGuideOnce prevents duplicates).
 */
export async function runUserGuide(userId: string) {
  if (!userId) return;

  try {
    // 1. KYC status
    const kyc = await getKycStatus(userId);
    const kycStatus = kyc?.status ?? "none";

    // 2. Profile (phone = mobile verification indicator)
    const profile = await getProfile(userId);
    const hasPhone = !!profile?.phone_number;

    // 3. Wallet balance
    const wallet = await getWallet(userId);
    const balance = wallet?.balance ?? 0;

    // 4. Cases submitted
    const caseCount = await getCaseCount(userId) ?? 0;

    // 5. Cases helped (unlocked)
    const helpCount = await getHelpCount(userId) ?? 0;

    // --- Welcome (first) ---
    await sendGuideOnce(
      userId,
      "guide_welcome",
      "Welcome to Givethra! 🤝",
      "We're glad you're here. Let's set up your account so you can give and receive verified help.",
      "/profile/me"
    );

    // --- Step 1: KYC ---
    if (kycStatus === "none") {
      await sendGuideOnce(
        userId,
        "guide_kyc",
        "Next step: Verify your identity 🪪",
        "Complete your KYC to unlock all features — submit cases and help others. It only takes a few minutes.",
        "/kyc"
      );
      return; // KYC first, then continue later
    }

    // --- Step 2: Profile / mobile ---
    if (kycStatus === "approved" && !hasPhone) {
      await sendGuideOnce(
        userId,
        "guide_profile",
        "Complete your profile 📝",
        "Add your mobile number and details to build trust. A complete profile helps people connect with you.",
        "/edit-profile"
      );
    }

    // --- Step 3: Deposit (if wallet is empty) ---
    if (kycStatus === "approved" && balance < 1) {
      await sendGuideOnce(
        userId,
        "guide_deposit",
        "Add credits to your wallet 💰",
        "You need credits to submit a case (1 credit) or help someone as a Hero. Add credits easily via NayaPay or USDT.",
        "/wallet"
      );
    }

    // --- Step 4: First action (case or help) ---
    if (kycStatus === "approved" && balance >= 1 && caseCount === 0 && helpCount === 0) {
      await sendGuideOnce(
        userId,
        "guide_first_action",
        "You're all set! 🎉",
        "Submit your own case if you need help, or browse verified cases and help someone directly.",
        "/cases"
      );
    }
  } catch (e) {
    console.error("userGuide error", e);
  }
}
