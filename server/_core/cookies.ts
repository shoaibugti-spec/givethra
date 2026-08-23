import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure" | "maxAge"> {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  };
}

// ✅ نیا: پرانی کوکیز کو صاف کرنے کا فنکشن
export function clearSessionCookie(
  req: Request,
  res: Response
): void {
  const options = getSessionCookieOptions(req);
  res.clearCookie("auth_token", {
    ...options,
    maxAge: 0,
  });
  res.clearCookie("user_email", {
    ...options,
    maxAge: 0,
  });
  res.clearCookie("givethra_role", {
    ...options,
    maxAge: 0,
  });
}

// ✅ نیا: تمام کوکیز کو صاف کرنے کا فنکشن (Cache Delete کے لیے)
export function clearAllCookies(
  req: Request,
  res: Response
): void {
  const options = getSessionCookieOptions(req);
  const cookiesToClear = [
    "auth_token",
    "user_email", 
    "givethra_role",
    "session",
    "connect.sid",
    "token",
    "refresh_token",
    "access_token",
  ];

  cookiesToClear.forEach((name) => {
    res.clearCookie(name, {
      ...options,
      maxAge: 0,
    });
  });

  // ✅ Cache-Control ہیڈرز بھی بھیجیں تاکہ براؤزر کیشے صاف کرے
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}
