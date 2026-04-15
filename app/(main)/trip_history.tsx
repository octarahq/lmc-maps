import { HistoryIcon } from "@/assets/icons";
import Header from "@/components/layout/Header";
import { createTranslator } from "@/i18n";
import {
  telemetryFeatureUsed,
  telemetryNavigationStart,
} from "@/services/TelemetryService";
import { getRecentTrips } from "@/utils/recentTrips";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SearchResult } from "./(search)/search";

export default function TripHistoryScreen() {
  const { t } = createTranslator("trip_history");
  const [recentTrips, setRecentTrips] = React.useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await getRecentTrips();
      if (!mounted) return;
      setRecentTrips(r);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    telemetryNavigationStart("trip_history_screen");
  }, []);

  return (
    <View style={styles.container}>
      <Header title={t("title")} />
      {recentTrips.length === 0 ? (
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#90adcb" }}>{t("emptyState.title")}</Text>
          <Text style={{ color: "#90adcb" }}>
            {t("emptyState.description")}
          </Text>
        </View>
      ) : (
        recentTrips.map((r) => (
          <SearchResult
            key={`${r.lat}_${r.lng}_${r.ts}`}
            icon={<HistoryIcon />}
            title={r.name || r.address || ""}
            subtitle={r.address || ""}
            onPress={() => {
              telemetryFeatureUsed("recent_trip_selected", {
                trip_index: recentTrips.indexOf(r),
              });
              router.push({
                pathname: "/(main)/place",
                params: {
                  name: r.name,
                  address: r.address,
                  lat: String(r.lat),
                  lng: String(r.lng),
                },
              });
            }}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101922",
    padding: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  loginContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#0d7ff2",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  email: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#0d7ff2",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    bottom: 40,
  },
  backButtonText: {
    color: "#0d7ff2",
    fontSize: 14,
  },
});
