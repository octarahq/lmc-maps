import { OctaraService } from "@/services/OctaraService";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export function useLocationWebSocket(role: "sharer" | "viewer") {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const retryCount = useRef(0);

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

  const connect = useCallback(async () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    const token = await OctaraService.getAccessToken();
    if (!token) {
      console.error("[WebSocket] Aucun token trouvé.");
      return;
    }

    const wsUrl = OctaraService.getWebSocketUrl(token, role);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      retryCount.current = 0;

      startHeartbeat();
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "location_sync") {
          setViewersData(data);
        }
      } catch (e) {
        console.error("[WebSocket] Erreur parsing message:", e);
      }
    };

    ws.current.onclose = (e) => {
      setIsConnected(false);
      stopHeartbeat();

      if (e.code !== 1000) {
        attemptReconnect();
      }
    };

    ws.current.onerror = (error) => {
      console.error(`[WebSocket] Erreur:`, error);
    };
  }, [role]);

  const attemptReconnect = useCallback(() => {
    const nextRetryIn = Math.min(1000 * Math.pow(2, retryCount.current), 30000);

    reconnectTimeoutRef.current = setTimeout(() => {
      retryCount.current++;
      connect();
    }, nextRetryIn);
  }, [connect]);

  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current)
      clearInterval(heartbeatIntervalRef.current);
  };

  useEffect(() => {
    connect();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          retryCount.current = 0;
          connect();
        }
      }
    });

    return () => {
      subscription.remove();
      stopHeartbeat();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close(1000);
      }
    };
  }, [connect]);

  const sendLocation = useCallback(
    (lat: number, lng: number, battery?: number, altitude?: number) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "location",
            lat,
            lng,
            battery: battery || null,
            altitude: altitude || null,
            timestamp: Date.now(),
          }),
        );
      }
    },
    [],
  );

  return { isConnected, sendLocation, viewersData };
}
