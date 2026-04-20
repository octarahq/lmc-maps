import Header from "@/components/layout/Header";
import MapProvider from "@/components/map";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationSharing } from "@/contexts/LocationSharingContext";
import { createTranslator } from "@/i18n";
import { OctaraService, OctaraUser } from "@/services/OctaraService";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  const {
    isSharing,
    sharingWith,
    viewersData,
    startSharing,
    stopSharing,
    connectToViewer,
    disconnectViewer,
  } = useLocationSharing();

  const [targetUser, setTargetUser] = useState<OctaraUser | null>(null);
  const [fetchingTarget, setFetchingTarget] = useState(true);
  const [sharingInProgress, setSharingInProgress] = useState(false);

  useEffect(() => {
    telemetryNavigationStart("share_location_view_screen");
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      ToastAndroid.show(t("login_required"), ToastAndroid.LONG);
      router.push("/");
      return;
    }

    if (!user || !userId) return;

    setFetchingTarget(true);
    connectToViewer(userId);

    OctaraService.fetchTargetedLocationSharingUsers(userId)
      .then((shares) => {
        if (shares && shares.length > 0) {
          const shareFromTarget = shares.find(
            (s: any) => s.whoShare.id === userId,
          );
          if (shareFromTarget) {
            setTargetUser(shareFromTarget.whoShare);
            return;
          }
          const shareToTarget = shares.find((s: any) => s.toWho.id === userId);
          if (shareToTarget) {
            setTargetUser(shareToTarget.toWho);
            return;
          }
        }

        if (userId === user.id) {
          setTargetUser(user);
          return;
        }

        return OctaraService.searchUsers(userId).then((users) => {
          if (users.length > 0) {
            setTargetUser(users[0]);
          } else {
            return OctaraService.fetchNearbyUsers().then((nearby) => {
              const found = nearby.find((u) => u.id === userId);
              if (found) setTargetUser(found);
            });
          }
        });
      })
      .catch(() => {})
      .finally(() => setFetchingTarget(false));

    return () => {
      disconnectViewer();
    };
  }, [user, userId, isLoading]);

  const timeAgo = (timestamp: number) => {
    if (!timestamp) return "...";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return t("just_now", { count: seconds });
    const minutes = Math.floor(seconds / 60);
    return t("minutes_ago", { count: minutes });
  };

  const handleSharePosition = async () => {
    if (!userId || sharingInProgress) return;
    setSharingInProgress(true);
    try {
      await startSharing(userId);
      ToastAndroid.show(t("share_success"), ToastAndroid.SHORT);
    } catch (err) {
      ToastAndroid.show(t("share_failure"), ToastAndroid.SHORT);
    } finally {
      setSharingInProgress(false);
    }
  };

  const handleStopSharing = async () => {
    await stopSharing();
    ToastAndroid.show(t("sharing_stopped"), ToastAndroid.SHORT);
  };

  if (isLoading || (fetchingTarget && !targetUser)) {
    return (
      <View style={styles.container}>
        <Header title={t("title")} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0d7ff2" />
          <Text style={styles.centerText}>{t("loading")}</Text>
        </View>
      </View>
    );
  }

  const isMeSharingWithThisUser = isSharing && sharingWith === userId;
  const lastUpdate = viewersData?.timestamp
    ? timeAgo(viewersData.timestamp)
    : null;

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

  const displayName =
    targetUser?.name || targetUser?.email || t("unknown_user");

  return (
    <View style={styles.container}>
      <Header title={t("title")} />

      <View style={styles.infoContainer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{displayName}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: viewersData ? "#4ade8020" : "#ff444420" },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: viewersData ? "#4ade80" : "#ff4444" },
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                { color: viewersData ? "#4ade80" : "#ff4444" },
              ]}
            >
              {viewersData ? t("online") : t("offline")}
            </Text>
          </View>
        </View>

        {lastUpdate && (
          <Text style={styles.timeText}>
            {t("updated")} {lastUpdate}
          </Text>
        )}
      </View>

      <View style={styles.mapWrapper}>
        <MapProvider
          showUserLocation={true}
          showControls={false}
          style={styles.map}
          goTo={
            viewersData
              ? { lat: viewersData.lat, lng: viewersData.lng }
              : undefined
          }
          showUsersPosition={
            usersPositions.length > 0 ? usersPositions : undefined
          }
        />
      </View>

      <View style={styles.footer}>
        {!isMeSharingWithThisUser ? (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              sharingInProgress && styles.disabledButton,
            ]}
            onPress={handleSharePosition}
            disabled={sharingInProgress}
          >
            {sharingInProgress ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("share_position")}</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleStopSharing}
          >
            <Text style={styles.buttonText}>{t("stop_sharing")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101922",
    paddingTop: 24,
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
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  timeText: {
    color: "#90adcb",
    fontSize: 14,
    marginTop: 4,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2e3a4c",
    backgroundColor: "#1a2533",
  },
  map: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  primaryButton: {
    height: 60,
    borderRadius: 20,
    backgroundColor: "#0d7ff2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#0d7ff2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  dangerButton: {
    height: 60,
    borderRadius: 20,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
});
