import { useAuth } from "@/contexts/AuthContext";
import { createTranslator } from "@/i18n";
import {
  startBackgroundLocationSharing,
  stopBackgroundLocationSharing,
} from "@/services/LocationTask";
import { OctaraService } from "@/services/OctaraService";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

let Notifications: any = null;
try {
  Notifications = require("expo-notifications");
} catch (e) {}

interface LocationData {
  lat: number;
  lng: number;
  battery: number | null;
  timestamp: number;
  isLive: boolean;
  sharerId: string;
}

interface LocationSharingContextType {
  isSharing: boolean;
  sharingWith: string | null;
  viewersData: LocationData | null;
  startSharing: (targetUserId: string) => Promise<void>;
  stopSharing: () => Promise<void>;
  connectToViewer: (sharerId: string) => void;
  disconnectViewer: () => void;
  isConnected: boolean;
}

const SHARING_NOTIF_ID = "location-sharing-control";
const SHARING_CATEGORY = "LOCATION_SHARING_CONTROL";
const STOP_ACTION_ID = "stop-sharing-action";

const LocationSharingContext = createContext<
  LocationSharingContextType | undefined
>(undefined);

export const LocationSharingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { t } = createTranslator("share_location_view");
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [sharingWith, setSharingWith] = useState<string | null>(null);
  const [viewersData, setViewersData] = useState<LocationData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sharerWs = useRef<WebSocket | null>(null);
  const viewerWs = useRef<WebSocket | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const activeViewerId = useRef<string | null>(null);
  const isSharingRef = useRef(false);

  const connectSharer = useCallback(async () => {
    if (sharerWs.current) {
      sharerWs.current.onclose = null;
      sharerWs.current.close();
    }

    const token = await OctaraService.getAccessToken();
    if (!token) return;

    const url = OctaraService.getWebSocketUrl(token, "sharer");
    const ws = new WebSocket(url);
    sharerWs.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      setIsConnected(false);
      if (isSharingRef.current) {
        setTimeout(connectSharer, 5000);
      }
    };

    ws.onmessage = () => {};
  }, []);

  const connectViewer = useCallback(async (sharerId: string) => {
    if (viewerWs.current) {
      viewerWs.current.onclose = null;
      viewerWs.current.close();
    }

    const token = await OctaraService.getAccessToken();
    if (!token) return;

    const url = `${OctaraService.getWebSocketUrl(token, "viewer")}&sharerId=${sharerId}`;
    const ws = new WebSocket(url);
    viewerWs.current = ws;

    ws.onopen = () => {};

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "location_sync" || data.lat !== undefined) {
          setViewersData({
            lat: data.lat,
            lng: data.lng,
            battery: data.battery || null,
            timestamp: Date.now(),
            isLive: data.isLive !== false,
            sharerId: sharerId,
          });
        }
      } catch (e) {}
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      if (activeViewerId.current === sharerId) {
        setTimeout(() => connectViewer(sharerId), 5000);
      }
    };
  }, []);

  const sendLocation = useCallback((lat: number, lng: number) => {
    if (sharerWs.current?.readyState === WebSocket.OPEN) {
      sharerWs.current.send(
        JSON.stringify({
          type: "location",
          lat,
          lng,
          timestamp: Date.now(),
          battery: null,
        }),
      );
    }
  }, []);

  const dismissNotification = useCallback(async () => {
    try {
      if (Notifications && Notifications.dismissNotificationAsync) {
        await Notifications.dismissNotificationAsync(SHARING_NOTIF_ID);
      }
    } catch (e) {}
  }, []);

  const showSharingNotification = useCallback(async () => {
    try {
      if (!Notifications) return;

      await Notifications.setNotificationCategoryAsync(SHARING_CATEGORY, [
        {
          identifier: STOP_ACTION_ID,
          buttonTitle: t("stop_sharing_action"),
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.scheduleNotificationAsync({
        identifier: SHARING_NOTIF_ID,
        content: {
          title: t("notification_title"),
          body: t("notification_body"),
          categoryIdentifier: SHARING_CATEGORY,
          sticky: true,
          autoDismiss: false,
        },
        trigger: null,
      });
    } catch (e) {}
  }, [t]);

  const stopSharing = useCallback(async () => {
    isSharingRef.current = false;

    if (sharingWith) {
      try {
        await OctaraService.stopSharingLocation(sharingWith);
      } catch (e) {}
    }

    setIsSharing(false);
    setSharingWith(null);
    setIsConnected(false);

    if (locationSubscription.current) {
      try {
        if (typeof locationSubscription.current.remove === "function") {
          locationSubscription.current.remove();
        }
      } catch (e) {
        console.warn(
          "[LocationSharingContext] Failed to remove subscription:",
          e,
        );
      }
      locationSubscription.current = null;
    }

    if (sharerWs.current) {
      sharerWs.current.onclose = null;
      sharerWs.current.close();
      sharerWs.current = null;
    }

    try {
      await stopBackgroundLocationSharing();
    } catch (e) {}

    await dismissNotification();
  }, [sharingWith, dismissNotification]);

  const startSharing = useCallback(
    async (targetUserId: string) => {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== "granted") {
        throw new Error("Location permission denied");
      }

      const success = await OctaraService.shareLocationWithUser(
        targetUserId,
        1,
      );

      if (!success) {
        throw new Error("API share failed");
      }

      isSharingRef.current = true;
      setIsSharing(true);
      setSharingWith(targetUserId);

      await connectSharer();
      await new Promise((r) => setTimeout(r, 1500));

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          sendLocation(loc.coords.latitude, loc.coords.longitude);
        },
      );

      try {
        await startBackgroundLocationSharing(
          t("notification_title"),
          t("notification_body"),
        );
      } catch (err) {}

      await showSharingNotification();
    },
    [connectSharer, sendLocation, t, showSharingNotification],
  );

  const connectToViewer = useCallback(
    (sharerId: string) => {
      activeViewerId.current = sharerId;
      connectViewer(sharerId);
    },
    [connectViewer],
  );

  const disconnectViewer = useCallback(() => {
    activeViewerId.current = null;
    if (viewerWs.current) {
      viewerWs.current.onclose = null;
      viewerWs.current.close();
      viewerWs.current = null;
    }
    setViewersData(null);
  }, []);

  useEffect(() => {
    if (!Notifications) return;
    try {
      const subscription =
        Notifications.addNotificationResponseReceivedListener(
          (response: any) => {
            if (response.actionIdentifier === STOP_ACTION_ID) {
              stopSharing();
            }
          },
        );
      return () => subscription.remove();
    } catch (e) {}
  }, [stopSharing]);

  useEffect(() => {
    return () => {
      isSharingRef.current = false;
      if (locationSubscription.current) {
        try {
          if (typeof locationSubscription.current.remove === "function") {
            locationSubscription.current.remove();
          }
        } catch (e) {
          console.warn(
            "[LocationSharingContext] Failed to remove subscription in cleanup:",
            e,
          );
        }
      }
      if (sharerWs.current) {
        sharerWs.current.onclose = null;
        sharerWs.current.close();
      }
      if (viewerWs.current) {
        viewerWs.current.onclose = null;
        viewerWs.current.close();
      }
    };
  }, []);

  return (
    <LocationSharingContext.Provider
      value={{
        isSharing,
        sharingWith,
        viewersData,
        startSharing,
        stopSharing,
        connectToViewer,
        disconnectViewer,
        isConnected,
      }}
    >
      {children}
    </LocationSharingContext.Provider>
  );
};

export const useLocationSharing = () => {
  const context = useContext(LocationSharingContext);
  if (!context)
    throw new Error(
      "useLocationSharing must be used within LocationSharingProvider",
    );
  return context;
};
