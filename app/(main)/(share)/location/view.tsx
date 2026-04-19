import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { createTranslator } from "@/i18n";
import { OctaraService } from "@/services/OctaraService";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";

export default function ShareLocationViewScreen() {
  const { t } = createTranslator("share_location_view");
  const { userId } = useLocalSearchParams();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    telemetryNavigationStart("share_location_view_screen");
  }, []);

  useEffect(() => {
    if (!user) {
      ToastAndroid.show(t("login_required"), ToastAndroid.LONG);
      router.push("/");
    } else {
      OctaraService.fetchTargetedLocationSharingUsers(userId as string).then(
        (users) => {
          console.log("Users sharing location with you:", users);
        },
      );
    }
  }, [user, t]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title={t("title")} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e3e3e3" />
          <Text style={styles.centerText}>{t("loading")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t("title")} />

      <ScrollView contentContainerStyle={styles.scrollContent}></ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: "#101922",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  centerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#e3e3e3",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#e3e3e3",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchArea: { paddingHorizontal: 12 },
  searchBox: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#12202a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { color: "#90adcb", marginRight: 8 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2e3a4c",
    backgroundColor: "#1a2533",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2e3a4c",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  placeName: {
    color: "#e3e3e3",
    fontSize: 16,
    fontWeight: "bold",
  },
  placeType: {
    color: "#e3e3e3",
    fontSize: 14,
    marginTop: 4,
  },
});
