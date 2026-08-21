import { type Backend, ExternalBlob, createActor } from "@/backend";

let _actor: Backend | null = null;

const noopUpload = async (_file: ExternalBlob): Promise<Uint8Array> =>
  new Uint8Array();
const noopDownload = async (_bytes: Uint8Array): Promise<ExternalBlob> =>
  ExternalBlob.fromBytes(new Uint8Array());

export function resolveCanisterId(): string | undefined {
  const win = window as unknown as Record<string, unknown>;

  // Resolution chain (synchronous)
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

  if (id && id.trim() !== "" && id !== "undefined") {
    return id.trim();
  }

  // Hardcoded final fallback — deployed backend canister ID for Givethra
  return "fw2ho-kyaaa-aaaac-baffa-cai";
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
