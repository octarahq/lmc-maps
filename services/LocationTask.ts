import { Platform } from "react-native";

export const LOCATION_SHARING_TASK_NAME = "LOCATION_SHARING_TASK";

let TaskManager: any = null;
let Location: any = null;

if (Platform.OS !== "web") {
  try {
    TaskManager = require("expo-task-manager");
    Location = require("expo-location");
  } catch (e) {}
}

const OctaraService = require("./OctaraService").OctaraService;

try {
  if (TaskManager && typeof TaskManager.defineTask === "function") {
    TaskManager.defineTask(
      LOCATION_SHARING_TASK_NAME,
      async ({ data, error }: any) => {
        if (error) return;
        if (data) {
          const { locations } = data;
          const location = locations[0];
          if (location) {
            const { latitude, longitude, altitude } = location.coords;
            try {
              const token = await OctaraService.getAccessToken();
              if (token) {
                const url = OctaraService.getWebSocketUrl(token, "sharer");
                const ws = new WebSocket(url);
                ws.onopen = () => {
                  ws.send(
                    JSON.stringify({
                      type: "location",
                      lat: latitude,
                      lng: longitude,
                      altitude: altitude || null,
                      timestamp: Date.now(),
                    }),
                  );
                  setTimeout(() => ws.close(), 1000);
                };
              }
            } catch (err) {}
          }
        }
      },
    );
  }
} catch (e) {}

export async function startBackgroundLocationSharing(
  title?: string,
  body?: string,
) {
  const hasNativeBridge =
    Location &&
    typeof Location.startLocationUpdatesAsync === "function" &&
    TaskManager &&
    typeof TaskManager.isTaskRegisteredAsync === "function";

  if (!hasNativeBridge) return;

  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") return;

    await Location.startLocationUpdatesAsync(LOCATION_SHARING_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 20,
      foregroundService: {
        notificationTitle: title || "Sharing Location",
        notificationBody: body || "Your location is being shared.",
        notificationColor: "#0d7ff2",
      },
    });
  } catch (e) {}
}

export async function stopBackgroundLocationSharing() {
  const hasNativeBridge =
    Location &&
    typeof Location.stopLocationUpdatesAsync === "function" &&
    TaskManager &&
    typeof TaskManager.isTaskRegisteredAsync === "function";

  if (!hasNativeBridge) return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_SHARING_TASK_NAME,
    );
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_SHARING_TASK_NAME);
    }
  } catch (e) {}
}
