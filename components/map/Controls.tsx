import { useHapticSettings } from "@/contexts/HapticSettingsContext";
import { usePosition } from "@/contexts/PositionContext";
import { snapPointsPercent } from "@/utils/snapPoints";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import LayersPanel from "./LayersPanel";
import { useMap } from "./MapContext";
import { useMapLayers } from "./MapLayersContext";

export default function Controls() {
  const m = useMap();
  const layers = useMapLayers();
  const { height: screenHeight } = useWindowDimensions();
  usePosition();
  const { followUser, centerAndFollow } = m;

  const isLightMap =
    (layers.mapType === "standard" || layers.mapType === "terrain") &&
    !layers.darkTheme;
  const iconColor = isLightMap ? "#000" : "#fff";
  const containerBg = isLightMap
    ? "rgba(0,0,0,0.12)"
    : "rgba(255,255,255,0.05)";
  const containerBorder = isLightMap
    ? "rgba(0,0,0,0.18)"
    : "rgba(255,255,255,0.2)";

  const snapPoints = React.useMemo(
    () => snapPointsPercent([240, 500], screenHeight),
    [screenHeight],
  );

  const centerOnUser = () => {
    if (followUser) {
      m.toggleFollow?.();
    } else {
      centerAndFollow?.();
    }
  };

  const { vibration } = useHapticSettings();
  const impactStyle = React.useMemo(() => {
    const force = vibration.force ?? 1;
    if (force <= 0.6) return Haptics.ImpactFeedbackStyle.Light;
    if (force <= 1.4) return Haptics.ImpactFeedbackStyle.Medium;
    return Haptics.ImpactFeedbackStyle.Heavy;
  }, [vibration.force]);

  const triggerHaptic = React.useCallback(() => {
    Haptics.impactAsync(impactStyle).catch(() => {
      try {
        Haptics.selectionAsync();
      } catch (e) {}
    });
  }, [impactStyle]);

  return (
    <>
      <View style={styles.buttonContainer} pointerEvents="box-none">
        <View style={styles.container}>
          <BlurView
            intensity={50}
            style={[
              styles.zoomGroup,
              { backgroundColor: containerBg, borderColor: containerBorder },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.zoomButton,
                {
                  borderBottomColor: isLightMap
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(255,255,255,0.1)",
                },
              ]}
              onPress={() => {
                triggerHaptic();
                m.zoomIn();
              }}
            >
              <Text style={[styles.icon, { color: iconColor }]}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.zoomButton,
                {
                  borderBottomColor: isLightMap
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(255,255,255,0.1)",
                },
              ]}
              onPress={() => {
                triggerHaptic();
                m.zoomOut();
              }}
            >
              <Text style={[styles.icon, { color: iconColor }]}>−</Text>
            </TouchableOpacity>
          </BlurView>

          <BlurView
            intensity={50}
            style={[
              styles.largeButtonWrapper,
              { backgroundColor: containerBg, borderColor: containerBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.largeButton}
              onPress={() => {
                triggerHaptic();
                centerOnUser();
              }}
            >
              <Svg width={24} height={24} viewBox="0 -960 960 960">
                <Path
                  d="M440-82v-40q-125-14-214.5-103.5T122-440H82q-17 0-28.5-11.5T42-480q0-17 11.5-28.5T82-520h40q14-125 103.5-214.5T440-838v-40q0-17 11.5-28.5T480-918q17 0 28.5 11.5T520-878v40q125 14 214.5 103.5T838-520h40q17 0 28.5 11.5T918-480q0 17-11.5 28.5T878-440h-40q-14 125-103.5 214.5T520-122v40q0 17-11.5 28.5T480-42q-17 0-28.5-11.5T440-82Zm238-200q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82Zm-311-85q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-447 560-480t-23.5-56.5Q513-560 480-560t-56.5 23.5Q400-513 400-480t23.5 56.5Q447-400 480-400t56.5-23.5ZM480-480Z"
                  fill={followUser ? "#0d7ff2" : iconColor}
                />
              </Svg>
            </TouchableOpacity>
          </BlurView>

          <BlurView
            intensity={50}
            style={[
              styles.largeButtonWrapper,
              { backgroundColor: containerBg, borderColor: containerBorder },
            ]}
          >
            <TouchableOpacity
              style={styles.largeButton}
              onPress={() => {
                triggerHaptic();
                layers.openLayers();
              }}
            >
              <Svg width={24} height={24} viewBox="0 -960 960 960">
                <Path
                  d="M161-366q-16-12-15.5-31.5T162-429q11-8 24-8t24 8l270 209 270-209q11-8 24-8t24 8q16 12 16.5 31.5T799-366L529-156q-22 17-49 17t-49-17L161-366Zm270 8L201-537q-31-24-31-63t31-63l230-179q22-17 49-17t49 17l230 179q31 24 31 63t-31 63L529-358q-22 17-49 17t-49-17Zm49-64 230-178-230-178-230 178 230 178Zm0-178Z"
                  fill={iconColor}
                />
              </Svg>
            </TouchableOpacity>
          </BlurView>
        </View>
      </View>

      {layers.layersOpen && (
        <View style={styles.sheetWrapper}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={layers.closeLayers}
            accessibilityLabel="Dismiss layers panel"
          />
          <BottomSheet
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: "rgba(16,25,34,1)" }}
            handleIndicatorStyle={{
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
            onClose={layers.closeLayers}
          >
            <BottomSheetView
              style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}
            >
              <LayersPanel onClose={layers.closeLayers} />
            </BottomSheetView>
          </BottomSheet>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  zoomGroup: {
    flexDirection: "column",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 0,
      },
    }),
  },
  zoomButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  largeButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 0,
      },
    }),
  },
  largeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { color: "#fff", fontSize: 24, lineHeight: 24 },
  primary: { color: "#0d7ff2" },
  buttonContainer: {
    position: "absolute",
    right: 12,
    top: "40%",
    zIndex: 80,
  },
  sheetWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
