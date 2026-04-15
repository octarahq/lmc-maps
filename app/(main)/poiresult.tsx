import {
  AddressIcon,
  CommercialIcon,
  FoodIcon,
  GasIcon,
  HealthIcon,
  ParkingIcon,
} from "@/assets/icons";
import Header from "@/components/layout/Header";
import { usePosition } from "@/contexts/PositionContext";
import { createTranslator } from "@/i18n";
import OverpassService, {
  NeerAmenityResponse,
} from "@/services/OverpassService";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function POISearchScreen() {
  const { t } = createTranslator("poi_search");
  const [results, setResults] = React.useState<NeerAmenityResponse | null>(
    null,
  );
  const { loading, position } = usePosition();

  useEffect(() => {
    telemetryNavigationStart("poi_search_screen");
  }, []);

  useEffect(() => {
    if (position) {
      OverpassService.fetchNeerAmenity(
        position.latitude,
        position.longitude,
        1000,
        "restaurant",
      )
        .then((res) => {
          setResults(res);
        })
        .catch(() => setResults([]));
    }
  }, [loading, position]);

  if (loading || results === null) {
    return (
      <View style={styles.container}>
        <Header title={t("title")} />
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <ActivityIndicator size="large" color="#e3e3e3" />
          <Text style={styles.centerText}>{t("loading")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={t("title")} />
      <View
        style={{
          padding: 16,
          marginEnd: 12,
        }}
      >
        <Text style={{ color: "#e3e3e3", fontSize: 18, fontWeight: "bold" }}>
          Nearby Classic
        </Text>

        {results.length === 0 && (
          <Text style={{ color: "#e3e3e3", fontSize: 14, marginTop: 8 }}>
            {t("no_results")}
          </Text>
        )}

        {results.map((result) => {
          const isFoodPlace = [
            "restaurant",
            "fast_food",
            "cafe",
            "bar",
            "pub",
            "food_court",
          ].includes(result.tags.amenity || "");
          const isCommercial = [
            "retail",
            "supermarket",
            "bakery",
            "convenience",
            "pharmacy",
            "clothes",
          ].includes(result.tags.amenity || "");
          const isParking = result.tags.amenity === "parking";
          const isFuel = result.tags.amenity === "fuel";
          const isHealth = [
            "hospital",
            "clinic",
            "pharmacy",
            "doctors",
          ].includes(result.tags.amenity || "");

          const PlaceIcon = isFoodPlace ? (
            <FoodIcon />
          ) : isCommercial ? (
            <CommercialIcon />
          ) : isHealth ? (
            <HealthIcon />
          ) : isParking ? (
            <ParkingIcon />
          ) : isFuel ? (
            <GasIcon />
          ) : (
            <AddressIcon />
          );
          return (
            <TouchableOpacity
              key={result.id}
              onPress={() =>
                router.push({
                  pathname: "/(main)/place",
                  params: {
                    osm_id: result.id,
                    osm_type: result.type[0].toUpperCase(),
                    osm_value: result.tags.amenity,
                    address: result.tags.address,
                    name: result.tags.name,
                    lat: result.lat,
                    lng: result.lon,
                  },
                })
              }
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "#2e3a4c",
                  backgroundColor: "#1a2533",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "#2e3a4c",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  {PlaceIcon}
                </View>
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text
                    style={{
                      color: "#e3e3e3",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {result.tags.name || "Unknown Restaurant"}
                  </Text>
                  <Text
                    style={{ color: "#e3e3e3", fontSize: 14, marginTop: 4 }}
                  >
                    {result.tags.cuisine || result.tags.amenity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101922",
    padding: 16,
  },
  centerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#e3e3e3",
  },
});
