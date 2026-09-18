export type RiskLevel = "stable" | "watch" | "elevated";

export function riskLevel(band: string | null): RiskLevel {
  if (band === "OPTIMAL") return "stable";
  if (band === "HIGH_RISK") return "elevated";
  return "watch";
}
