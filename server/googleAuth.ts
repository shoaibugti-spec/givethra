import type { Express, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { COOKIE_NAME } from "../shared/const";
import { upsertUser } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

type GoogleClaims = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

function isVerifiedEmail(value: GoogleClaims["email_verified"]) {
  return value === true || value === "true" || value === undefined;
}

async function verifyGoogleCredential(credential: string) {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured");

  if (credential.startsWith("ya29.") || credential.length < 100) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(credential)}`);
    if (!response.ok) {
      throw new Error("Failed to verify Google access token");
    }
    const data = (await response.json()) as { sub?: string; email?: string; email_verified?: boolean | string; name?: string; picture?: string };
    if (!data.sub || !data.email) {
      throw new Error("Google did not return verified user information");
    }
    return {
      sub: data.sub,
      email: data.email.toLowerCase(),
      name: data.name?.trim() || data.email.split("@")[0],
      picture: data.picture,
    };
  }

  const { payload } = await jwtVerify<GoogleClaims>(credential, googleJwks, {
    algorithms: ["RS256"],
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });

  if (!payload.sub || !payload.email || !isVerifiedEmail(payload.email_verified)) {
    throw new Error("Google did not return a verified account");
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split("@")[0],
    picture: payload.picture,
  };
}

function sendAuthError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unable to verify Google sign-in";
  console.warn("[GoogleAuth]", message);
  return res.status(401).json({ error: message });
}

export function registerGoogleAuthRoutes(app: Express) {
  app.post("/api/auth/google", async (req: Request, res: Response) => {
    const credential = typeof req.body?.credential === "string" ? req.body.credential : "";
    if (!credential) return res.status(400).json({ error: "Google credential is required" });

    try {
      // ✅ پہلے پرانی کوکیز اور کیشے صاف کریں
      await sdk.clearUserSession(req, res);

      const identity = await verifyGoogleCredential(credential);
      const ownerEmail = (process.env.GIVETHRA_ADMIN_EMAIL || "").trim().toLowerCase();
      const role = ownerEmail && identity.email === ownerEmail ? "admin" : "user";
      const openId = `google:${identity.sub}`;

      await upsertUser({
        openId,
        name: identity.name,
        email: identity.email,
        loginMethod: "google",
        role,
        lastSignedIn: new Date(),
      });

      const token = await sdk.createSessionToken(openId, { name: identity.name });
      res.cookie(COOKIE_NAME, token, getSessionCookieOptions(req));

      return res.status(200).json({
        token,
        user: {
          id: openId,
          email: identity.email,
          name: identity.name,
          role,
          picture: identity.picture,
        },
      });
    } catch (error) {
      return sendAuthError(res, error);
    }
  });
}
