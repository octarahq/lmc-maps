import React from "react";

export type MapControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (zoom: number) => void;
  panTo: (lat: number, lng: number) => void;
  zoomTo: (lat: number, lng: number, zoom: number) => void;
  setUserLocation?: (lat: number, lng: number) => void;
  followUser?: boolean;
  toggleFollow?: () => void;
  centerAndFollow?: () => void;
};

export const MapContext = React.createContext<MapControls | null>(null);

export function useMap() {
  const ctx = React.useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within MapProvider");
  return ctx;
}

export default MapContext;
