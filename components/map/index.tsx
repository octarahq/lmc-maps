import ShadcnMap from "@/components/ShadcnMap";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { usePosition } from "@/contexts/PositionContext";
import Controls from "./Controls";
import MapCtx, { MapControls } from "./MapContext";
import { MapLayersProvider, useMapLayers } from "./MapLayersContext";

type Props = {
  style?: any;
  children?: React.ReactNode;
  showUserLocation?: boolean;
  showControls?: boolean;
};

export default function MapProvider({
  style,
  children,
  showUserLocation = true,
  showControls = true,
}: Props) {
  return (
    <MapLayersProvider>
      <MapProviderContent
        style={style}
        showUserLocation={showUserLocation}
        showControls={showControls}
      >
        {children}
      </MapProviderContent>
    </MapLayersProvider>
  );
}

function MapProviderContent({
  style,
  children,
  showUserLocation = true,
  showControls = true,
}: Props) {
  const layers = useMapLayers();
  const webviewRef = useRef<any>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [height, setHeight] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setHeight(h);
  }, []);

  const isFullScreen =
    height !== null && Math.abs((height || 0) - windowHeight) < 8;
  const initialZoom = isFullScreen ? 2 : 3;

  const post = (obj: any) => {
    try {
      webviewRef.current?.postMessage(JSON.stringify(obj));
    } catch {}
  };

  const { position } = usePosition();

  const [followUser, setFollowUser] = useState(false);
  const ignoreMapMove = useRef(false);
  const followRef = useRef(followUser);

  const [mapReady, setMapReady] = useState(false);
  const pendingPositionRef = useRef<typeof position | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);

  useEffect(() => {
    followRef.current = followUser;
  }, [followUser]);

  const controls: MapControls = React.useMemo(() => {
    const getMaxZoom = () => (layers.mapType === "terrain" ? 17 : 19);
    return {
      zoomIn: () => {
        const maxZ = getMaxZoom();
        if (currentZoom === null || currentZoom < maxZ)
          post({ type: "zoomBy", delta: 1 });
      },
      zoomOut: () => post({ type: "zoomBy", delta: -1 }),
      setZoom: (zoom: number) => {
        const maxZ = getMaxZoom();
        const target = Math.min(zoom, maxZ);
        post({ type: "setZoom", zoom: target });
      },
      panTo: (lat: number, lng: number) => post({ type: "panTo", lat, lng }),
      zoomTo: (lat: number, lng: number, zoom: number) => {
        const maxZ = getMaxZoom();
        const target = Math.min(zoom, maxZ);
        post({ type: "zoomTo", lat, lng, zoom: target });
      },
      setUserLocation: (lat: number, lng: number) =>
        post({ type: "setUserMarker", lat, lng }),
      followUser,
      toggleFollow: () => {
        setFollowUser((f) => {
          const next = !f;
          if (!next) {
            post({
              type: "panTo",
              lat: 0,
              lng: 0,
              animate: true,
              duration: 0.6,
            });
          }
          return next;
        });
      },
      centerAndFollow: () => {
        if (position) {
          ignoreMapMove.current = true;
          setTimeout(() => {
            ignoreMapMove.current = false;
          }, 1000);
          const maxZ = layers.mapType === "terrain" ? 16 : 19;
          const targetZoom = Math.min(maxZ, 17);

          post({
            type: "zoomTo",
            lat: position.latitude,
            lng: position.longitude,
            zoom: targetZoom,
            animate: true,
            duration: 0.6,
          });
          setFollowUser(true);
        }
      },
    };
  }, [followUser, position, layers.mapType, currentZoom]);

  const handleMapMsg = React.useCallback(
    (msg: any) => {
      if (!msg) return;
      if (msg.type === "mapReady") {
        setMapReady(true);
        return;
      }
      if (msg.type === "zoomChanged") {
        setCurrentZoom(msg.zoom);
        return;
      }
      if (msg.type === "mapMoved") {
        if (ignoreMapMove.current) {
          ignoreMapMove.current = false;
          return;
        }
        if (followUser) {
          setFollowUser(false);
        }
      }
    },
    [followUser],
  );

  useEffect(() => {
    if (!showUserLocation) {
      post({ type: "clearUserMarker" });
      setFollowUser(false);
      return;
    }
    if (!position) return;
    if (!mapReady) {
      pendingPositionRef.current = position;
      return;
    }

    pendingPositionRef.current = null;
    ignoreMapMove.current = true;
    setTimeout(() => {
      ignoreMapMove.current = false;
    }, 1000);
    post({
      type: "setUserMarker",
      lat: position.latitude,
      lng: position.longitude,
      center: true,
      offsetY: 120,
      animate: true,
      duration: 0.6,
    });

    setFollowUser(true);
    post({
      type: "zoomTo",
      lat: position.latitude,
      lng: position.longitude,
      zoom: 17,
      animate: true,
      duration: 0.6,
    });
  }, [position, initialZoom, mapReady, showUserLocation]);

  useEffect(() => {
    if (!mapReady) return;
    if (!showUserLocation) {
      post({ type: "clearUserMarker" });
      return;
    }
    const p = pendingPositionRef.current;
    if (!p) return;
    pendingPositionRef.current = null;
    ignoreMapMove.current = true;
    setTimeout(() => {
      ignoreMapMove.current = false;
    }, 1000);
    post({
      type: "setUserMarker",
      lat: p.latitude,
      lng: p.longitude,
      center: true,
      offsetY: 120,
      animate: true,
      duration: 0.6,
    });
    setFollowUser(true);
    post({
      type: "zoomTo",
      lat: p.latitude,
      lng: p.longitude,
      zoom: 17,
      animate: true,
      duration: 0.6,
    });
  }, [mapReady, showUserLocation]);

  useEffect(() => {
    if (!mapReady) return;
    const theme = layers.darkTheme ? "dark" : "light";
    const maxZ = layers.mapType === "terrain" ? 17 : 19;

    if (currentZoom !== null && currentZoom > maxZ) {
      post({ type: "setZoom", zoom: maxZ, animate: false });
      setCurrentZoom(maxZ);
    }

    post({ type: "setBaseLayer", layer: layers.mapType, theme });
  }, [layers.mapType, layers.darkTheme, mapReady, currentZoom]);
  return (
    <MapCtx.Provider value={controls}>
      <View style={[styles.container, style]} onLayout={onLayout}>
        <ShadcnMap
          ref={webviewRef}
          initialZoom={initialZoom}
          onMapMessage={handleMapMsg}
        />
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          {children}
          {showControls && <Controls />}
        </View>
      </View>
    </MapCtx.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 100 },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  rightControls: { position: "absolute", right: 12, top: "40%", zIndex: 80 },
});
