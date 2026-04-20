import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

import { useUser, type UserProfile } from "@/contexts/UserContext";

export type MapType = "standard" | "satellite" | "terrain";

type MapStyle = NonNullable<UserProfile["settings"]["mapStyle"]>;

function parseMapStyle(style: MapStyle): {
  mapType: MapType;
  darkTheme: boolean;
} {
  switch (style) {
    case "standard":
      return { mapType: "standard", darkTheme: false };
    case "standard_dark":
      return { mapType: "standard", darkTheme: true };
    case "satelite":
      return { mapType: "satellite", darkTheme: false };
    case "terrain":
      return { mapType: "terrain", darkTheme: false };
    case "terrain_dark":
      return { mapType: "terrain", darkTheme: true };
    default:
      return { mapType: "standard", darkTheme: true };
  }
}

function buildMapStyle(mapType: MapType, darkTheme: boolean): MapStyle {
  if (mapType === "satellite") return "satelite";
  if (mapType === "terrain") return darkTheme ? "terrain_dark" : "terrain";
  return darkTheme ? "standard_dark" : "standard";
}

interface MapLayersContextValue {
  layersOpen: boolean;
  openLayers: () => void;
  closeLayers: () => void;

  mapType: MapType;
  setMapType: (type: MapType) => void;

  traffic: boolean;
  setTraffic: (enabled: boolean) => void;

  publicTransport: boolean;
  setPublicTransport: (enabled: boolean) => void;

  buildings3d: boolean;
  setBuildings3d: (enabled: boolean) => void;

  darkTheme: boolean;
  setDarkTheme: (dark: boolean) => void;
}

export const MapLayersContext =
  React.createContext<MapLayersContextValue | null>(null);

export function useMapLayers() {
  const ctx = React.useContext(MapLayersContext);
  if (!ctx) {
    throw new Error("useMapLayers must be used within MapLayersProvider");
  }
  return ctx;
}

interface MapLayersProviderProps {
  children: React.ReactNode;
}

export function MapLayersProvider({ children }: MapLayersProviderProps) {
  const { settings, setSettings } = useUser();

  const { mapType, darkTheme } = React.useMemo(
    () => parseMapStyle(settings.mapStyle ?? "satelite"),
    [settings.mapStyle],
  );

  const setMapType = React.useCallback(
    (type: MapType) => {
      const newStyle = buildMapStyle(type, darkTheme);
      setSettings({ ...settings, mapStyle: newStyle });
    },
    [darkTheme, settings, setSettings],
  );

  const setDarkTheme = React.useCallback(
    (dark: boolean) => {
      const newStyle = buildMapStyle(mapType, dark);
      setSettings({ ...settings, mapStyle: newStyle });
    },
    [mapType, settings, setSettings],
  );

  const [layersOpen, setLayersOpen] = React.useState(false);
  const [traffic, setTraffic] = React.useState(false);
  const [publicTransport, setPublicTransport] = React.useState(false);
  const [buildings3d, setBuildings3d] = React.useState(true);
  const STORAGE_KEY = "map_layers_v1";

  React.useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (!mounted) return;
          if (typeof parsed.traffic === "boolean") setTraffic(parsed.traffic);
          if (typeof parsed.publicTransport === "boolean")
            setPublicTransport(parsed.publicTransport);
          if (typeof parsed.buildings3d === "boolean")
            setBuildings3d(parsed.buildings3d);
        } catch {}
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const toSave = {
      traffic,
      publicTransport,
      buildings3d,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [traffic, publicTransport, buildings3d]);

  const value: MapLayersContextValue = React.useMemo(
    () => ({
      layersOpen,
      openLayers: () => setLayersOpen(true),
      closeLayers: () => setLayersOpen(false),
      mapType,
      setMapType,
      traffic,
      setTraffic,
      publicTransport,
      setPublicTransport,
      buildings3d,
      setBuildings3d,
      darkTheme,
      setDarkTheme,
    }),
    [
      layersOpen,
      mapType,
      setMapType,
      traffic,
      publicTransport,
      buildings3d,
      darkTheme,
      setDarkTheme,
    ],
  );

  return (
    <MapLayersContext.Provider value={value}>
      {children}
    </MapLayersContext.Provider>
  );
}
