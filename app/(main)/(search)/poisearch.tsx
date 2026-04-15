import Header from "@/components/layout/Header";
import { createTranslator } from "@/i18n";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function POISearchScreen() {
  const { t } = createTranslator("poi_search");

  useEffect(() => {
    telemetryNavigationStart("poi_search_screen");
  }, []);

  return (
    <View style={styles.container}>
      <Header title={t("title")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
});
