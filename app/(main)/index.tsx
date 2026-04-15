import { FoodIcon, GasIcon, ParkingIcon } from "@/assets/icons";
import MoreHorIcon from "@/assets/icons/MoreHorIcon";
import { Sidebar } from "@/components/layout/Sidebar";
import MapProvider from "@/components/map";
import { usePosition } from "@/contexts/PositionContext";
import { createTranslator } from "@/i18n";
import {
  telemetryFeatureUsed,
  telemetryNavigationStart,
} from "@/services/TelemetryService";
import { snapPointsPercent } from "@/utils/snapPoints";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MapOverlay from "./_components/MapOverlay";

export default function MainScreen() {
  const { t } = createTranslator("main");
  const { height: screenHeight } = useWindowDimensions();
  const sheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(
    () => snapPointsPercent([180], screenHeight),
    [screenHeight],
  );
  const [blockMap, setBlockMap] = React.useState(false);
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);
  const pos = usePosition();

  React.useEffect(() => {
    telemetryNavigationStart("home_screen");
  }, []);

  return (
    <MapProvider style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar
          hidden
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <MapOverlay
          blockMap={blockMap}
          onAvatarPress={() => setSidebarVisible(true)}
        />
        <Sidebar
          isVisible={isSidebarVisible}
          onClose={() => setSidebarVisible(false)}
        />
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          index={0}
          enablePanDownToClose={false}
          backgroundStyle={{ backgroundColor: "rgba(16,25,34,0.96)" }}
          handleIndicatorStyle={{
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
          onChange={(index) => {
            setBlockMap(index > 0);
          }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>
              {pos?.position?.city
                ? t("sheet.exploreCity", { city: pos.position.city })
                : t("sheet.exploreArea")}
            </Text>
            <View style={styles.itemsContainer}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  telemetryFeatureUsed("home_explore_gas");
                  router.push("/(main)/(search)/poisearch?type=gas");
                }}
              >
                <View style={styles.itemBox}>
                  <GasIcon />
                </View>

                <Text style={styles.itemLabel}>{t("items.gas")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  telemetryFeatureUsed("home_explore_food");
                  router.push("/(main)/(search)/poisearch?type=food");
                }}
              >
                <View style={styles.itemBox}>
                  <FoodIcon />
                </View>

                <Text style={styles.itemLabel}>{t("items.food")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  telemetryFeatureUsed("home_explore_parking");
                  router.push("/(main)/(search)/poisearch?type=parking");
                }}
              >
                <View style={styles.itemBox}>
                  <ParkingIcon />
                </View>

                <Text style={styles.itemLabel}>{t("items.parking")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  router.push("/(main)/(search)/poisearch");
                }}
              >
                <View style={styles.itemBox}>
                  <MoreHorIcon />
                </View>

                <Text style={styles.itemLabel}>{t("items.more")}</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </MapProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  sheetContent: {
    padding: 16,
    alignItems: "flex-start",
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  itemsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  item: { alignItems: "center", width: "22%" },
  itemBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 6 },
});
