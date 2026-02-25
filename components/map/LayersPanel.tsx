import { useHapticSettings } from "@/contexts/HapticSettingsContext";
import { createTranslator } from "@/i18n";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useMapLayers } from "./MapLayersContext";

interface LayersPanelProps {
  onClose: () => void;
}

const MAP_TYPES = [
  {
    id: "standard" as const,
    label: "Standard",
    path: "m574-129-214-75-186 72q-10 4-19.5 2.5T137-136q-8 5-12.5 13.5T120-169v-561q0-13 7.5-23t20.5-15l186-63q6-2 12.5-3t13.5-1q7 0 13.5 1t12.5 3l214 75 186-72q10-4 19.5-2.5T823-824q8 5 12.5 13.5T840-791v561q0 13-7.5 23T812-192l-186 63q-6 2-12.5 3t-13.5 1q-7 0-13.5-1t-12.5-3Zm-14-89v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z",
  },
  {
    id: "satellite" as const,
    label: "Satellite",
    path: "M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-7-.5-14.5T799-507q-5 29-27 48t-52 19h-80q-33 0-56.5-23.5T560-520v-40H400v-80q0-33 23.5-56.5T480-720h40q0-23 12.5-40.5T563-789q-20-5-40.5-8t-42.5-3q-134 0-227 93t-93 227h200q66 0 113 47t47 113v40H400v110q20 5 39.5 7.5T480-160Z",
  },
  {
    id: "terrain" as const,
    label: "Terrain",
    path: "M120-240q-25 0-36-22t4-42l160-213q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l148 197h300L560-586l-68 90q-12 16-28 16.5t-28-8.5q-12-9-16-24.5t8-31.5l100-133q6-8 14.5-12t17.5-4q9 0 17.5 4t14.5 12l280 373q15 20 4 42t-36 22H120Zm340-80h300-312 68.5H460Zm-260 0h160l-80-107-80 107Zm0 0h160-160Z",
  },
];

export default function LayersPanel({ onClose }: LayersPanelProps) {
  const layers = useMapLayers();
  const { t } = createTranslator("main");
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("layers.title")}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Svg width={24} height={24} viewBox="0 -960 960 960">
            <Path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
              fill="#fff"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("layers.mapType")}</Text>
        <View style={styles.mapTypesGrid}>
          {MAP_TYPES.map((mapType) => (
            <TouchableOpacity
              key={mapType.id}
              style={[
                styles.mapTypeButton,
                layers.mapType === mapType.id && styles.mapTypeButtonActive,
              ]}
              onPress={() => {
                triggerHaptic();
                layers.setMapType(mapType.id);
              }}
            >
              <View
                style={[
                  styles.mapTypeIcon,
                  layers.mapType === mapType.id && styles.mapTypeIconActive,
                ]}
              >
                <Svg width={24} height={24} viewBox="0 -960 960 960">
                  <Path
                    d={mapType.path}
                    fill={layers.mapType === mapType.id ? "#000" : "#e3e3e3"}
                  />
                </Svg>
              </View>
              <Text
                style={[
                  styles.mapTypeLabel,
                  layers.mapType === mapType.id && styles.mapTypeLabelActive,
                ]}
              >
                {t(`layers.mapTypes.${mapType.id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t("layers.details")}</Text>

        {["standard", "terrain"].includes(layers.mapType) && (
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <View style={styles.detailIcon}>
                <Svg width={24} height={24} viewBox="0 -960 960 960">
                  <Path
                    d="M483-80q-84 0-157.5-32t-128-86.5Q143-253 111-326.5T79-484q0-124 68.5-225T331-857q14-5 29-3.5t25 9.5q8 7 12.5 19.5T402-799q2 79 32 150.5T520-521q56 56 128 86t151 32q21 0 32 3.5t18 11.5q8 10 10.5 26t-2.5 29q-46 115-148 184T483-80Zm0-80q88 0 163-44t118-121q-86-8-163-43.5T463-465q-61-61-97-138t-43-163q-77 43-120.5 118.5T159-484q0 135 94.5 229.5T483-160Zm-20-305Zm109-203-64-64q-12-12-12-28t12-28l64-64q12-12 28-12t28 12l64 64q12 12 12 28t-12 28l-64 64q-12 12-28 12t-28-12Zm200 120-24-24q-12-12-12-28t12-28l24-24q12-12 28-12t28 12l24 24q12 12 12 28t-12 28l-24 24q-12 12-28 12t-28-12Z"
                    fill="#e3e3e3"
                  />
                </Svg>
              </View>
              <Text style={styles.detailLabel}>{t("layers.darkMap")}</Text>
            </View>
            <Switch
              value={layers.darkTheme}
              onValueChange={(v) => {
                triggerHaptic();
                layers.setDarkTheme(v);
              }}
              trackColor={{
                false: "rgba(255,255,255,0.1)",
                true: "rgba(255,255,255,0.25)",
              }}
              thumbColor={layers.darkTheme ? "#fff" : "#fff"}
              style={styles.toggle}
            />
          </View>
        )}
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={styles.detailIcon}>
              <Svg width={24} height={24} viewBox="0 -960 960 960">
                <Path
                  d="M240-200v20q0 25-17.5 42.5T180-120q-25 0-42.5-17.5T120-180v-286q0-7 1-14t3-13l75-213q8-24 29-39t47-15h410q26 0 47 15t29 39l75 213q2 6 3 13t1 14v286q0 25-17.5 42.5T780-120q-25 0-42.5-17.5T720-180v-20H240Zm-8-360h496l-42-120H274l-42 120Zm-32 80v200-200Zm100 160q25 0 42.5-17.5T360-380q0-25-17.5-42.5T300-440q-25 0-42.5 17.5T240-380q0 25 17.5 42.5T300-320Zm360 0q25 0 42.5-17.5T720-380q0-25-17.5-42.5T660-440q-25 0-42.5 17.5T600-380q0 25 17.5 42.5T660-320Zm-460 40h560v-200H200v200Z"
                  fill="#e3e3e3"
                />
              </Svg>
            </View>
            <Text style={styles.detailLabel}>{t("layers.traffic")}</Text>
          </View>
          <Switch
            value={layers.traffic}
            onValueChange={(v) => {
              triggerHaptic();
              layers.setTraffic(v);
            }}
            trackColor={{
              false: "rgba(255,255,255,0.1)",
              true: "rgba(255,255,255,0.25)",
            }}
            thumbColor={layers.traffic ? "#fff" : "#fff"}
            style={styles.toggle}
          />
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={styles.detailIcon}>
              <Svg width={24} height={24} viewBox="0 -960 960 960">
                <Path
                  d="M160-340v-380q0-53 27.5-84.5t72.5-48q45-16.5 102.5-22T480-880q66 0 124.5 5.5t102 22q43.5 16.5 68.5 48t25 84.5v380q0 59-40.5 99.5T660-200l20 20q17 17 8 38.5T655-120q-7 0-13.5-2.5T630-130l-70-70H400l-70 70q-5 5-11.5 7.5T305-120q-23 0-32.5-21.5T280-180l20-20q-59 0-99.5-40.5T160-340Zm320-460q-106 0-155 12.5T258-760h448q-15-17-64.5-28.5T480-800ZM240-560h200v-120H240v120Zm420 80H240h480-60Zm-140-80h200v-120H520v120ZM383-337q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm280 0q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-363 57h360q26 0 43-17t17-43v-140H240v140q0 26 17 43t43 17Zm180-480h226-448 222Z"
                  fill="#e3e3e3"
                />
              </Svg>
            </View>
            <Text style={styles.detailLabel}>
              {t("layers.publicTransport")}
            </Text>
          </View>
          <Switch
            value={layers.publicTransport}
            onValueChange={(v) => {
              triggerHaptic();
              layers.setPublicTransport(v);
            }}
            trackColor={{
              false: "rgba(255,255,255,0.1)",
              true: "rgba(255,255,255,0.25)",
            }}
            thumbColor={layers.publicTransport ? "#fff" : "#fff"}
            style={styles.toggle}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  mapTypesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  mapTypeButton: {
    flex: 1,
    alignItems: "center",
    gap: 12,
  },
  mapTypeButtonActive: {},
  mapTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapTypeIconActive: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  iconSymbol: {
    fontSize: 28,
  },
  mapTypeLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  mapTypeLabelActive: {
    fontWeight: "700",
    color: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailIconSymbol: {
    fontSize: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  toggle: {
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
  themeToggleRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  themeButtonActive: {
    backgroundColor: "#0d7ff2",
    borderColor: "#0d7ff2",
  },
  themeButtonText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  themeButtonTextActive: {
    color: "#fff",
  },
});
