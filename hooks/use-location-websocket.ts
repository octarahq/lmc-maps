import { OctaraService } from "@/services/OctaraService";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export function useLocationWebSocket(role: "sharer" | "viewer") {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [viewersData, setViewersData] = useState<{
    type: string;
    sharerId: string;
    lat: number;
    lng: number;
    battery: number;
    timestamp: number;
    isLive: boolean;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = async () => {
      const token = await OctaraService.getAccessToken();
      if (!token) {
        console.error("Impossible de se connecter au WS : Aucun token.");
        return;
      }

      const wsUrl = OctaraService.getWebSocketUrl(token, role);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        if (isMounted) setIsConnected(true);
        console.log(`[WebSocket] Connecté en tant que ${role}`);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "location_sync") {
            if (isMounted) setViewersData(data);
          }
        } catch (e) {
          console.error("[WebSocket] Erreur parsing message:", e);
        }
      };

      ws.current.onclose = () => {
        if (isMounted) setIsConnected(false);
        console.log(`[WebSocket] Déconnecte (${role})`);
      };

      ws.current.onerror = (error) => {
        console.error(`[WebSocket] Erreur:`, error);
      };
    };

    connectWebSocket();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        ws.current?.close();
      } else if (nextAppState === "active" && !isConnected) {
        connectWebSocket();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [role]);

  const sendLocation = (lat: number, lng: number, battery?: number) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "location",
          lat,
          lng,
          battery: battery || null,
          timestamp: Date.now(),
        }),
      );
    } else {
      console.warn("[WebSocket] Websocket non connecte");
    }
  };

  return { isConnected, sendLocation, viewersData };
}
