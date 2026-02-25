import * as Location from "expo-location";
import React from "react";

type Position = {
  latitude: number;
  longitude: number;
  city?: string | null;
  country?: string | null;
};

type State = {
  position: Position | null;
  loading: boolean;
  error?: string | null;
  refresh: () => Promise<void>;
};

const PositionContext = React.createContext<State | null>(null);

export function usePosition() {
  const ctx = React.useContext(PositionContext);
  if (!ctx) throw new Error("usePosition must be used within PositionProvider");
  return ctx;
}

export function PositionProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = React.useState<Position | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const doRefresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("permission denied");
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { coords } = pos;
      const rev = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      const first = rev && rev[0] ? rev[0] : null;
      const city = first?.city || first?.region || first?.subregion || null;
      const country = first?.country || null;
      setPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
        city,
        country,
      });
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void doRefresh();
  }, [doRefresh]);

  const value = React.useMemo(
    () => ({ position, loading, error, refresh: doRefresh }),
    [position, loading, error, doRefresh],
  );

  return (
    <PositionContext.Provider value={value}>
      {children}
    </PositionContext.Provider>
  );
}

export default PositionContext;
