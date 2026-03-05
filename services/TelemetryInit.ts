import { TelemetryService, telemetryAppStart } from "./TelemetryService";

export async function initTelemetry(
  privacyLevel: "total" | "necessary" | "limited" | "none",
) {
  TelemetryService.setPrivacyLevel(privacyLevel);

  const payload = await telemetryAppStart({
    timestamp: Date.now(),
    privacy_level: privacyLevel,
  });

  if (payload) {
    await TelemetryService.sendTelemetry(payload);
  }
}

export function updateTelemetryConsent(
  privacyLevel: "total" | "necessary" | "limited" | "none",
) {
  TelemetryService.setPrivacyLevel(privacyLevel);
}
