import MapSnapshot from "@/components/MapSnapshot";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RouteParams = {
  name?: string;
  mode?: string;
  totalDuration?: string;
  totalDistance?: string;
  avgSpeed?: string;
  startLat?: string;
  startLng?: string;
  destLat?: string;
  destLng?: string;
};

const parseNumber = (value: string | undefined, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatDuration = (seconds: number): string => {
  if (seconds <= 0) return "0 min";
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder} min` : `${hours}h`;
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(Math.max(0, meters))} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export default function ArrivedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top - 10, 4);
  const params = useLocalSearchParams<RouteParams>();

  const destinationName = (params.name || "Destination").trim();
  const totalDuration = parseNumber(params.totalDuration, 0);
  const totalDistance = parseNumber(params.totalDistance, 0);
  const avgSpeed = parseNumber(params.avgSpeed, 0);

  const startLat = parseNumber(params.startLat, NaN);
  const startLng = parseNumber(params.startLng, NaN);
  const destLat = parseNumber(params.destLat, NaN);
  const destLng = parseNumber(params.destLng, NaN);

  const hasMapPoints =
    Number.isFinite(startLat) &&
    Number.isFinite(startLng) &&
    Number.isFinite(destLat) &&
    Number.isFinite(destLng);

  const pins = React.useMemo(() => {
    if (!hasMapPoints) return [];
    return [
      { lat: startLat, lng: startLng, type: "departure" as const },
      { lat: destLat, lng: destLng, type: "destination" as const },
    ];
  }, [hasMapPoints, startLat, startLng, destLat, destLng]);

  const routeCoords = React.useMemo(() => {
    if (!hasMapPoints) return [];
    return [
      { latitude: startLat, longitude: startLng },
      { latitude: destLat, longitude: destLng },
    ];
  }, [hasMapPoints, startLat, startLng, destLat, destLng]);

  return (
    <View style={[styles.safe, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.75}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Summary</Text>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>You have arrived</Text>
        </View>

        <View style={styles.mapCard}>
          {hasMapPoints ? (
            <MapSnapshot
              pins={pins}
              routeCoords={routeCoords}
              style={styles.mapSnapshot}
            />
          ) : (
            <View style={styles.mapFallback}>
              <MaterialIcons
                name="location-on"
                size={22}
                color={Colors.dark.primary}
              />
              <Text style={styles.mapFallbackText}>{destinationName}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <MaterialIcons
                name="schedule"
                size={18}
                color={Colors.dark.primary}
              />
              <Text style={styles.statLabel}>TIME</Text>
            </View>
            <Text style={styles.statValue}>
              {formatDuration(totalDuration)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHead}>
              <MaterialIcons
                name="route"
                size={18}
                color={Colors.dark.primary}
              />
              <Text style={styles.statLabel}>DISTANCE</Text>
            </View>
            <Text style={styles.statValue}>
              {formatDistance(totalDistance)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.statCardFull]}>
            <View style={styles.statHead}>
              <MaterialIcons
                name="speed"
                size={18}
                color={Colors.dark.primary}
              />
              <Text style={styles.statLabel}>AVG SPEED</Text>
            </View>
            <Text style={styles.statValue}>
              {Math.round(Math.max(0, avgSpeed))} km/h
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace("/search")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>
              Trouver un parking et finir a pied
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDark,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDark,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 42,
    height: 42,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  hero: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  heroSubtitle: {
    marginTop: 6,
    color: "#9aa6b2",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  mapCard: {
    backgroundColor: "#17232f",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#263445",
  },
  mapSnapshot: {
    height: 220,
    borderRadius: 0,
  },
  mapFallback: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapFallbackText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  mapTag: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16,25,34,0.85)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statsGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: "#17232f",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#263445",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statCardFull: {
    flexBasis: "100%",
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    color: "#9aa6b2",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  actions: {
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: "#1d2b39",
    borderWidth: 1,
    borderColor: "#2a3949",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
