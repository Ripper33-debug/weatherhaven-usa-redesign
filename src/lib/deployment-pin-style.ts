/** Map pin colors by deployment mission class. */

export type DeploymentPinKind = "military" | "humanitarian" | "scientific";

export const DEPLOYMENT_PIN_KINDS: DeploymentPinKind[] = ["military", "humanitarian", "scientific"];

export const DEPLOYMENT_PIN_LEGEND: { kind: DeploymentPinKind; label: string; color: string }[] = [
  { kind: "military", label: "Military / peacekeeping", color: "#4d9fff" },
  { kind: "humanitarian", label: "Humanitarian / medical", color: "#4ade80" },
  { kind: "scientific", label: "Scientific / commercial", color: "#f59e0b" },
];

export function deploymentPinKind(category: string): DeploymentPinKind {
  if (category === "Medical/Disaster Relief") return "humanitarian";
  if (category === "Commercial/Scientific") return "scientific";
  return "military";
}
