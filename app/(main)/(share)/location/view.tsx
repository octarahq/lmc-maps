import Header from "@/components/layout/Header";
import MapProvider from "@/components/map";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationWebSocket } from "@/hooks/use-location-websocket";
import { createTranslator } from "@/i18n";
import { OctaraService, OctaraUser } from "@/services/OctaraService";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShareLocationViewScreen() {
  const { t } = createTranslator("share_location_view");
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { isLoading, user } = useAuth();

  const { isConnected: isSharerConnected, sendLocation } =
    useLocationWebSocket("sharer");
  const { isConnected: isViewerConnected, viewersData } =
    useLocationWebSocket("viewer");
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );

  const [isTargetSharingWithMe, setIsTargetSharingWithMe] = useState(false);
  const [isMeSharingWithTarget, setIsMeSharingWithTarget] = useState(false);
  const [targetUser, setTargetUser] = useState<OctaraUser | null>(null);

  const usersPositions =
    viewersData?.lat && viewersData?.lng
      ? [
          {
            avatar_url: targetUser?.avatar_url || "",
            latitude: viewersData.lat,
            longitude: viewersData.lng,
          },
        ]
      : [];

  useEffect(() => {
    telemetryNavigationStart("share_location_view_screen");
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      ToastAndroid.show(t("login_required"), ToastAndroid.LONG);
      router.push("/");
      return;
    }

    if (user && userId) {
      OctaraService.fetchTargetedLocationSharingUsers(userId)
        .then((shares) => {
          if (shares && shares.length > 0) {
            const shareFromTarget = shares.find(
              (s: any) => s.whoShare.id === userId && s.toWho.id === user.id,
            );
            const shareToTarget = shares.find(
              (s: any) => s.whoShare.id === user.id && s.toWho.id === userId,
            );

            setIsTargetSharingWithMe(!!shareFromTarget);
            setIsMeSharingWithTarget(!!shareToTarget);

            if (shareFromTarget) setTargetUser(shareFromTarget.whoShare);
            else if (shareToTarget) setTargetUser(shareToTarget.toWho);

            if (shareToTarget) {
              startLiveTracking();
            }
          } else {
            setIsTargetSharingWithMe(false);
            setIsMeSharingWithTarget(false);
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des partages:", err);
        });
    }
  }, [user, userId, isLoading, t]);

  useEffect(() => {
    return () => {
      stopLiveTracking();
    };
  }, []);

  const handleSharePosition = () => {
    if (!userId) return;

    OctaraService.shareLocationWithUser(userId, 1).then((result) => {
      ToastAndroid.show(
        result ? t("share_success") : t("share_failure"),
        ToastAndroid.SHORT,
      );
      if (result) {
        setIsMeSharingWithTarget(true);
        startLiveTracking();
      }
    });
  };

  const startLiveTracking = async () => {
    // Évite de lancer deux instances de tracking
    if (locationSubscription.current) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      ToastAndroid.show(
        "Permission de localisation requise",
        ToastAndroid.SHORT,
      );
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        sendLocation(
          location.coords.latitude,
          location.coords.longitude,
          // altitude, battery
        );
        console.log("Position envoyée via WebSocket !");
      },
    );
  };

  const stopLiveTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleStopSharing = () => {
    stopLiveTracking();

    setIsMeSharingWithTarget(false);

    OctaraService.stopSharingLocation(userId);

    ToastAndroid.show("Partage arrêté", ToastAndroid.SHORT);
  };

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

  const isReceivingDataFromTarget =
    viewersData && viewersData.sharerId === userId;

  return (
    <View style={styles.container}>
      <Header title={t("title")} />

      <View>
        <Text style={styles.centerText}>
          {isTargetSharingWithMe && targetUser
            ? `${targetUser.name} partage sa position avec vous.`
            : targetUser
              ? `${targetUser.name} ${t("not_sharing")}`
              : t("not_sharing")}
        </Text>
      </View>

      <MapProvider
        showUserLocation={false}
        showControls={false}
        showUsersPosition={usersPositions}
      />

      <View style={styles.actionArea}>
        {!isMeSharingWithTarget ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSharePosition}
          >
            <Text style={styles.actionButtonText}>{t("share_position")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: "#8b0000",
              },
            ]}
            onPress={() => handleStopSharing()}
          >
            <Text style={styles.actionButtonText}>Arrêter le partage</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isTargetSharingWithMe && isReceivingDataFromTarget && (
          <View style={styles.card}>
            <View style={styles.textWrapper}>
              <Text
                style={[
                  styles.placeType,
                  { fontFamily: "monospace", marginTop: 10 },
                ]}
              >
                {JSON.stringify(viewersData, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {isTargetSharingWithMe && !isReceivingDataFromTarget && (
          <Text style={styles.centerText}>
            En attente de la position de {targetUser?.name}...
          </Text>
        )}
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
  actionArea: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
  },
  actionButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2e3a4c",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#e3e3e3",
    fontSize: 16,
    fontWeight: "bold",
  },
});
