import { useUser } from "@/contexts/UserContext";
import { TelemetryService } from "@/services/TelemetryService";
import { useEffect } from "react";

export function useTelemetry() {
  const { privacy, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      TelemetryService.setPrivacyLevel(privacy);
    }
  }, [privacy, isLoading]);

  return TelemetryService;
}
