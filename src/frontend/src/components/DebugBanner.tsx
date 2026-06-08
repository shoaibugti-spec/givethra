import { getBackendActor, resolveCanisterId } from "@/lib/actor";

function getCanisterWindowKeys(): Record<string, unknown> {
  const win = window as unknown as Record<string, unknown>;
  return Object.keys(win)
    .filter((k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"))
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = win[k];
      return acc;
    }, {});
}

function getEnvCanisterVars(): Record<string, string | undefined> {
  return Object.keys(import.meta.env)
    .filter((k) => k.startsWith("CANISTER"))
    .reduce<Record<string, string | undefined>>((acc, k) => {
      acc[k] = import.meta.env[k] as string | undefined;
      return acc;
    }, {});
}

export function DebugBanner() {
  return null;//
  const canisterId = resolveCanisterId();
  const actorStatus = getBackendActor() ? "connected" : "null - auth will fail";
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  const backendUrl = isLocal ? "http://localhost:4943" : "https://ic0.app";

  const windowKeys = getCanisterWindowKeys();
  const envVars = getEnvCanisterVars();

  const rows: { label: string; value: string; warn?: boolean }[] = [
    {
      label: "canisterId",
      value: canisterId ?? "UNDEFINED - backend unreachable",
      warn: !canisterId,
    },
    {
      label: "actor status",
      value: actorStatus,
      warn: actorStatus !== "connected",
    },
    { label: "backend URL", value: backendUrl },
    {
      label: "window.__CANISTER* / __ENV*",
      value:
        Object.keys(windowKeys).length > 0
          ? JSON.stringify(windowKeys)
          : "(none found)",
      warn: Object.keys(windowKeys).length === 0,
    },
    {
      label: "import.meta.env CANISTER_*",
      value:
        Object.keys(envVars).length > 0
          ? JSON.stringify(envVars)
          : "(none found)",
      warn: Object.keys(envVars).length === 0,
    },
  ];

  return (
    <div
      data-ocid="debug.banner"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#b91c1c",
        color: "#fff",
        fontFamily: "monospace",
        fontSize: 11,
        lineHeight: 1.5,
        padding: "6px 12px 8px",
        borderBottom: "2px solid #7f1d1d",
        boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 4,
          letterSpacing: "0.05em",
        }}
      >
        🛠 GIVETHRA DEBUG — Canister ID Diagnosis
      </div>
      {rows.map((row) => (
        <div key={row.label} style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              opacity: 0.75,
              minWidth: 230,
              flexShrink: 0,
            }}
          >
            {row.label}:
          </span>
          <span
            style={{
              color: row.warn ? "#fde68a" : "#bbf7d0",
              fontWeight: row.warn ? 700 : 400,
              wordBreak: "break-all",
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
