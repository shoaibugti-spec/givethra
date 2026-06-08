import { type Backend, ExternalBlob, createActor } from "@/backend";

let _actor: Backend | null = null;

const noopUpload = async (_file: ExternalBlob): Promise<Uint8Array> =>
  new Uint8Array();
const noopDownload = async (_bytes: Uint8Array): Promise<ExternalBlob> =>
  ExternalBlob.fromBytes(new Uint8Array());

export function resolveCanisterId(): string | undefined {
  // ── Scan window for all __CANISTER* and __ENV* keys (platform injection) ──
  const win = window as unknown as Record<string, unknown>;
  const canisterWindowKeys = Object.keys(win).filter(
    (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
  );
  console.log(
    "[Actor] Window keys matching __CANISTER* or __ENV*:",
    canisterWindowKeys,
    canisterWindowKeys.reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = win[k];
      return acc;
    }, {}),
  );

  // ── Log all import.meta.env CANISTER_* vars ──────────────────────────────
  const envKeys = Object.keys(import.meta.env).filter((k) =>
    k.startsWith("CANISTER"),
  );
  console.log(
    "[Actor] import.meta.env CANISTER_* keys:",
    envKeys,
    envKeys.reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = import.meta.env[k];
      return acc;
    }, {}),
  );
  console.log(
    "[Actor] CANISTER_ID_BACKEND (dot):",
    import.meta.env.CANISTER_ID_BACKEND,
  );
  console.log(
    "[Actor] VITE_CANISTER_ID_BACKEND:",
    import.meta.env.VITE_CANISTER_ID_BACKEND,
  );

  // ── Resolution chain (synchronous) ──────────────────────────────────────
  const id =
    // (a) vite-plugin-environment with prefix 'CANISTER_'
    (import.meta.env.CANISTER_ID_BACKEND as string | undefined) ||
    // (b) VITE_-prefixed fallback set in .env files
    (import.meta.env.VITE_CANISTER_ID_BACKEND as string | undefined) ||
    // (c) Platform injects window.__CANISTER_IDS__ = { backend: "xxx" }
    (win.__CANISTER_IDS__ as Record<string, string> | undefined)?.backend ||
    // (d) Platform injects window.__CANISTER_ID_BACKEND__ = "xxx"
    (win.__CANISTER_ID_BACKEND__ as string | undefined) ||
    // (e) Platform injects window.__ENV__ = { CANISTER_ID_BACKEND: "xxx" }
    (win.__ENV__ as Record<string, string> | undefined)?.CANISTER_ID_BACKEND ||
    // (f) process.env fallback (SSR / Node builds)
    (typeof process !== "undefined"
      ? (process.env?.CANISTER_ID_BACKEND as string | undefined)
      : undefined);

  console.log("[Actor] Resolved canisterId:", id ?? "undefined");

  if (id && id.trim() !== "" && id !== "undefined") {
    return id.trim();
  }

  // (g) Hardcoded final fallback — used when platform build-time injection fails.
  //     This is the deployed backend canister ID for Givethra.
  const FALLBACK_CANISTER_ID = "fw2ho-kyaaa-aaaac-baffa-cai";
  console.warn(
    "[Actor] All dynamic resolution paths returned undefined. Using hardcoded fallback canisterId:",
    FALLBACK_CANISTER_ID,
    "\n  Checked: CANISTER_ID_BACKEND, VITE_CANISTER_ID_BACKEND,",
    "window.__CANISTER_IDS__.backend, window.__CANISTER_ID_BACKEND__,",
    "window.__ENV__.CANISTER_ID_BACKEND, process.env.CANISTER_ID_BACKEND",
    "\n  All import.meta.env keys:",
    Object.keys(import.meta.env),
    "\n  All __CANISTER/__ENV window keys:",
    canisterWindowKeys,
  );
  return FALLBACK_CANISTER_ID;
}

export function resetBackendActor(): void {
  _actor = null;
}

export function getBackendActor(): Backend | null {
  if (!_actor) {
    const canisterId = resolveCanisterId();
    if (!canisterId) {
      console.warn(
        "[Givethra] Backend canister ID is not set — actor unavailable. " +
          "Tried: CANISTER_ID_BACKEND (dot+bracket), VITE_CANISTER_ID_BACKEND, window.__CANISTER_ID_BACKEND__, process.env",
      );
      return null;
    }
    console.log("[Actor] Creating actor with canisterId:", canisterId);
    try {
      _actor = createActor(canisterId, noopUpload, noopDownload);
      console.log(
        "[Actor] Actor created successfully for canisterId:",
        canisterId,
      );
    } catch (e) {
      console.error("[Actor] Actor creation FAILED:", e);
      return null;
    }
  }
  return _actor;
}

// Eagerly initialize at module load time so the actor is ready
// before React renders — prevents the "Not ready" race condition
// when Google GSI callback fires immediately after account selection.
getBackendActor();
