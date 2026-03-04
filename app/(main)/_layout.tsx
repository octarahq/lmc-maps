import { MapLayersProvider } from "@/components/map/MapLayersContext";
import { PositionProvider } from "@/contexts/PositionContext";
import { Slot } from "expo-router";
import React from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PermissionsProvider } from "../../contexts/PermissionsContext";

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <PermissionsProvider>
      <PositionProvider>
        <MapLayersProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                marginTop: -insets.top,
                paddingTop: 0,
              }}
            >
              <Slot />
            </View>
          </GestureHandlerRootView>
        </MapLayersProvider>
      </PositionProvider>
    </PermissionsProvider>
  );
}
