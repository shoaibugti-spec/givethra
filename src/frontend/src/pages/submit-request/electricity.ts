export const ELECTRICITY_MAX_ELIGIBLE_UNITS = 300;

export const ELECTRICITY_APPLIANCES = [
  { key: "fan", label: "Fan" },
  { key: "light", label: "Light / Bulb" },
  { key: "refrigerator", label: "Refrigerator" },
  { key: "television", label: "Television" },
  { key: "washing_machine", label: "Washing machine" },
  { key: "water_pump", label: "Water pump" },
  { key: "air_conditioner", label: "Air conditioner" },
  { key: "iron", label: "Iron" },
] as const;

export type ElectricityApplianceKey = (typeof ELECTRICITY_APPLIANCES)[number]["key"];
export function normalizeElectricityAppliances(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const result: Record<string, number> = {};
  for (const { key } of ELECTRICITY_APPLIANCES) {
    const count = Math.max(0, Math.floor(Number((value as Record<string, unknown>)[key]) || 0));
    if (count > 0) result[key] = count;
  }
  return result;
}
