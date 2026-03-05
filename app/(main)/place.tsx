import { SavePlaceModal } from "@/app/(main)/_components/SavePlaceModal";
import {
    AddressIcon,
    BackIcon,
    BookmarkIcon,
    CallIcon,
    DirectionsIcon,
    ShareIcon,
    WebIcon,
} from "@/assets/icons";
import ScheduleIcon from "@/assets/icons/ScheduleIcon";
import MapSnapshot from "@/components/MapSnapshot";
import { Colors } from "@/constants/theme";
import { createTranslator } from "@/i18n";
import FreePlaceDetailsService from "@/services/PlaceDetailService";
import {
    telemetryCrash,
    telemetryFeatureUsed,
    telemetryNavigationStart,
    telemetryNavigationStop,
} from "@/services/TelemetryService";
import { snapPointsPercent } from "@/utils/snapPoints";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    Linking,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PlaceDetails = {
  id?: string;
  title?: string;
  description?: string;
  phone?: string | null;
  website?: string | null;
  opening_hours?: string | null;
  photos?: { url: string }[];
};

export default function PlaceDetailScreen() {
  const { osm_id, osm_type, osm_value, address, name, lat, lng } =
    useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top - 10, 4);
  const { t } = createTranslator("place");
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);

  const WEB_BASE =
    process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "https://maps.lmcgroup.xyz";

  const handleShare = async () => {
    const params = new URLSearchParams();
    if (osm_id) params.set("osm_id", osm_id as string);
    if (osm_type) params.set("osm_type", osm_type as string);
    if (osm_value) params.set("osm_value", osm_value as string);
    if (name) params.set("name", placeTitle);
    if (address) params.set("address", placeAddress);
    const webUrl = `${WEB_BASE}/place?${params.toString()}`;
    try {
      await Share.share(
        Platform.OS === "ios"
          ? { url: webUrl, message: placeTitle }
          : { message: `${placeTitle}\n${webUrl}` },
      );
      telemetryFeatureUsed("place_shared", {
        place_type: osm_value || "unknown",
      });
    } catch {
      telemetryFeatureUsed("place_share_error", {
        place_type: osm_value || "unknown",
      });
    }
  };

  useEffect(() => {
    async function loadDetails() {
      if (!osm_id || !osm_type) {
        setLoading(false);
        return;
      }
      const startTime = Date.now();
      try {
        telemetryNavigationStart("place_details_load", {
          place_type: osm_value || "unknown",
        });
        const data = await FreePlaceDetailsService.fetchById(
          osm_type as "N" | "W" | "R",
          parseInt(osm_id as string),
        );
        setDetails(data);

        const duration = Date.now() - startTime;
        telemetryNavigationStop({
          duration_ms: duration,
          success: true,
          has_photos: !!data?.photos?.length,
          has_opening_hours: !!data?.opening_hours,
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : String(error);
        telemetryCrash(errorMsg, "", {
          place_type: osm_value || "unknown",
          duration_ms: duration,
        });
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [osm_id, osm_type]);

  const placeTitle = (details?.title || name || t("unknownPlace")) as string;
  const placeAddress = (address || details?.id || "") as string;

  const [ohUtils, setOhUtils] = useState<any>(null);
  const [ohStatus, setOhStatus] = useState<any>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const { height: screenHeight } = useWindowDimensions();
  const snapPoints = useMemo(() => {
    return snapPointsPercent([400], screenHeight);
  }, [screenHeight]);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (hoursModalVisible) {
      sheetRef.current.snapToIndex(0);
    } else {
      sheetRef.current.close();
    }
  }, [hoursModalVisible]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("@/utils/openingHours");
      if (!mounted) return;
      setOhUtils(mod);
      setOhStatus(mod.computeOpeningStatus(details?.opening_hours || null));
    })();
    return () => {
      mounted = false;
    };
  }, [details?.opening_hours]);

  const getCategorization = () => {
    const val = (osm_value as string) || "";
    if (["restaurant", "fast_food", "food_court"].includes(val))
      return t("categories.restaurant");
    if (["cafe", "bar", "pub"].includes(val)) return t("categories.cafe");
    if (val === "fuel") return t("categories.gasStation");
    if (val === "parking") return t("categories.parking");
    if (["hospital", "clinic", "pharmacy", "doctors"].includes(val))
      return t("categories.health");
    if (
      ["retail", "supermarket", "bakery", "convenience", "mall"].includes(val)
    )
      return t("categories.commerce");
    if (["bus_stop", "bus_station", "train_station", "tram_stop"].includes(val))
      return t("categories.publicTransport");
    return (
      val.charAt(0).toUpperCase() + val.slice(1).replace("_", " ") ||
      t("categories.location")
    );
  };

  const categoryLabel = getCategorization();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const headerImage = details?.photos?.[0]?.url || null;

  return (
    <View style={styles.container}>
      <StatusBar
        hidden
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t("title")}
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <ShareIcon />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {headerImage && (
          <View style={styles.imageContainer}>
            <ImageBackground
              source={{ uri: headerImage }}
              style={styles.heroImage}
              imageStyle={{ borderRadius: 16 }}
            />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{placeTitle}</Text>
          <Text style={styles.subtitle}>{categoryLabel}</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => {
                telemetryFeatureUsed("place_directions_requested", {
                  place_type: osm_value || "unknown",
                });
                router.push({
                  pathname: "/(main)/routePlanning",
                  params: {
                    name: placeTitle,
                    address: placeAddress,
                    lat: lat as string,
                    lng: lng as string,
                  },
                });
              }}
            >
              <DirectionsIcon />
              <Text style={styles.directionsText}>{t("directions")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                telemetryFeatureUsed("place_save_requested", {
                  place_type: osm_value || "unknown",
                });
                setSaveModalVisible(true);
              }}
            >
              <BookmarkIcon />
            </TouchableOpacity>
            {details?.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  telemetryFeatureUsed("place_phone_called", {
                    place_type: osm_value || "unknown",
                  });
                  Linking.openURL(`tel:${details.phone}`);
                }}
              >
                <CallIcon />
              </TouchableOpacity>
            )}
            {details?.website && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  telemetryFeatureUsed("place_website_opened", {
                    place_type: osm_value || "unknown",
                  });
                  WebBrowser.openBrowserAsync(details.website!);
                }}
              >
                <WebIcon />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <AddressIcon color={Colors.dark.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{t("address")}</Text>
                <Text style={styles.detailValue}>{placeAddress}</Text>
              </View>
            </View>

            {lat && lng ? (
              <View style={styles.placeMapPreviewFull}>
                <MapSnapshot
                  lat={parseFloat(lat as string)}
                  lng={parseFloat(lng as string)}
                />
              </View>
            ) : null}

            {details?.opening_hours && (
              <>
                <TouchableOpacity
                  style={styles.detailItem}
                  onPress={() => {
                    telemetryFeatureUsed("place_hours_viewed", {
                      place_type: osm_value || "unknown",
                    });
                    setHoursModalVisible(true);
                  }}
                >
                  <View style={styles.detailIconContainer}>
                    <ScheduleIcon color={Colors.dark.primary} />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>{t("hours")}</Text>
                    <View style={styles.hoursStatusRow}>
                      <Text style={styles.detailValue}>
                        {ohStatus
                          ? ((): string => {
                              const today = new Date().getDay();
                              const next = ohStatus.nextChange;
                              const daysAny = t("daysShort", {
                                returnObjects: true,
                              }) as unknown;
                              const daysShort = Array.isArray(daysAny)
                                ? (daysAny as string[])
                                : [];
                              const nextDay = next ? next.getDay() : null;

                              if (ohStatus.isOpen) {
                                const mins = ohStatus.minutesToChange;
                                if (mins != null && mins < 60)
                                  return t("closesIn", { mins });
                                return t("closesAt", {
                                  time: ohUtils.formatTimeForDisplay(
                                    ohStatus.nextChange,
                                  ),
                                });
                              } else {
                                const mins = ohStatus.minutesToChange;
                                if (mins != null && mins <= 4 * 60)
                                  return t("opensIn", { mins });
                                if (ohStatus.nextChange) {
                                  const time = ohUtils.formatTimeForDisplay(
                                    ohStatus.nextChange,
                                  );
                                  const daySuffix =
                                    nextDay !== null && nextDay !== today
                                      ? ` (${daysShort[nextDay]})`
                                      : "";
                                  return t("opensAt", { time }) + daySuffix;
                                }
                                return t("closed");
                              }
                            })()
                          : ""}
                      </Text>
                      {ohStatus ? (
                        ohStatus.isOpen ? (
                          <View style={styles.openBadge}>
                            <Text style={styles.openBadgeText}>
                              {t("openNow")}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.closedBadge}>
                            <Text style={styles.closedBadgeText}>
                              {t("closed")}
                            </Text>
                          </View>
                        )
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <SavePlaceModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        slot="other"
        initialName={placeTitle}
        initialAddress={placeAddress}
        initialLat={(lat as string) || ""}
        initialLng={(lng as string) || ""}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        style={{ zIndex: 9999, elevation: 9999 }}
        containerStyle={{ zIndex: 9999 }}
        enablePanDownToClose
        backgroundStyle={{
          backgroundColor: "rgba(16,35,52,1)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
        }}
        handleIndicatorStyle={{
          backgroundColor: "rgba(255,255,255,0.3)",
        }}
        onChange={(idx) => {
          if (idx === -1) {
            setHoursModalVisible(false);
          }
        }}
      >
        <BottomSheetView style={styles.hoursModalInner}>
          <Text style={styles.title}>{t("hours")}</Text>
          <ScrollView style={{ marginTop: 12 }}>
            {(ohStatus &&
              ohUtils?.formatDayLines(ohStatus.rules).map((l: string) => (
                <Text key={l} style={styles.hoursModalLine}>
                  {l}
                </Text>
              ))) || <Text style={styles.hoursModalLine}>Aucun</Text>}

            <View style={{ height: 24 }} />
            <TouchableOpacity
              onPress={() => setHoursModalVisible(false)}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>{t("ok")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101922",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroImage: {
    width: "100%",
    height: 256,
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#90adcb",
    fontSize: 16,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  directionsButton: {
    flex: 1,
    height: 56,
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  directionsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonIcon: {
    marginRight: 4,
  },
  actionButton: {
    width: 56,
    height: 56,
    backgroundColor: "#223649",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsList: {
    marginTop: 32,
    gap: 24,
  },
  detailItem: {
    flexDirection: "row",
    gap: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(13,127,242,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: "#90adcb",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 2,
  },

  placeMapPreview: {
    marginTop: 8,
    width: "100%",
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  placeMapPreviewFull: {
    marginTop: 12,
    marginHorizontal: 16,
    width: "auto",
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
  },
  hoursStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: "rgba(13,127,242,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  openBadge: {
    backgroundColor: "rgba(46,204,113,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  openBadgeText: {
    color: "#2ecc71",
    fontSize: 10,
    fontWeight: "800",
  },
  closedBadge: {
    backgroundColor: "rgba(255,107,107,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedBadgeText: {
    color: "#ff6b6b",
    fontSize: 10,
    fontWeight: "800",
  },
  subDetailValue: {
    color: "#90adcb",
    fontSize: 14,
    marginTop: 2,
  },
  navButton: {
    backgroundColor: Colors.dark.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 16,
  },
  backLink: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  hoursModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  hoursModalInner: {
    flex: 1,
    width: "100%",
    borderRadius: 16,
    padding: 16,
  },
  hoursModalLine: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
});
