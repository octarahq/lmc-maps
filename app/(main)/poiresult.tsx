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
  ScrollView,
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
    // On écoute les coordonnées spécifiques, pas l'objet 'position' entier
    // ni 'loading' pour éviter les appels API en boucle infinie.
  }, [position?.latitude, position?.longitude]);

  // Écran de chargement uniquement au TOUT PREMIER lancement
  if (results === null) {
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

      {/* On utilise ScrollView pour permettre à la page de défiler */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Nearby Classic</Text>
          {/* Petit indicateur visuel si le GPS cherche à s'affiner en arrière-plan */}
          {loading && <ActivityIndicator size="small" color="#e3e3e3" />}
        </View>

        {results.length === 0 && (
          <Text style={styles.noResultsText}>{t("no_results")}</Text>
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
              <View style={styles.card}>
                <View style={styles.iconWrapper}>{PlaceIcon}</View>
                {/* On limite le texte à sa colonne pour éviter qu'il pousse l'écran */}
                <View style={styles.textWrapper}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {result.tags.name || "Unknown Restaurant"}
                  </Text>
                  <Text style={styles.placeType} numberOfLines={1}>
                    {result.tags.cuisine || result.tags.amenity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#e3e3e3",
    fontSize: 18,
    fontWeight: "bold",
  },
  noResultsText: {
    color: "#e3e3e3",
    fontSize: 14,
    marginTop: 8,
  },
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
