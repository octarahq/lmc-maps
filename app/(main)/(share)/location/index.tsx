import { SearchIcon } from "@/assets/icons";
import { AvatarImg } from "@/components/AvatarImg";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { createTranslator } from "@/i18n";
import { OctaraService, OctaraUser } from "@/services/OctaraService";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

export default function ShareLocationScreen() {
  const { t } = createTranslator("share_location");
  const { isLoading, user } = useAuth();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<OctaraUser[] | null>(null);
  const [nearbyUsers, setNearbyUsers] = React.useState<OctaraUser[]>([]);
  const [actualySharing, setActualySharing] = React.useState<
    typeof OctaraService.fetchTargetedLocationSharingUsers extends () => Promise<
      infer U
    >
      ? U
      : never
  >([]);
  useEffect(() => {
    telemetryNavigationStart("share_location_screen");
  }, []);

  useEffect(() => {
    if (!user) {
      ToastAndroid.show(t("login_required"), ToastAndroid.LONG);
      router.push("/");
    } else {
      OctaraService.fetchNearbyUsers()
        .then((users) => {
          setNearbyUsers(users);
        })
        .catch(() => {
          setNearbyUsers([]);
        });
      OctaraService.fetchTargetedLocationSharingUsers()
        .then((users) => {
          setActualySharing(users);
        })
        .catch(() => {
          setActualySharing([]);
        });
    }
  }, [user, t]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults(null);
    } else {
      OctaraService.searchUsers(query)
        .then((users) => {
          console.log(users);
          setResults(users);
        })
        .catch(() => {
          setResults([]);
        });
    }
  }, [query]);

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchArea}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>
              <SearchIcon />
            </Text>
            <TextInput
              placeholder={t("placeholder")}
              placeholderTextColor="#90adcb"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>
        {actualySharing.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>{t("actually_sharing")}</Text>
            {actualySharing.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() =>
                  router.push({
                    pathname: "/(main)/(share)/location/view",
                    params: {
                      userId:
                        u.whoShare.id === user?.id ? u.toWho.id : u.whoShare.id,
                    },
                  })
                }
              >
                <View style={styles.card}>
                  <View style={styles.iconWrapper}>
                    <AvatarImg id={u.id} />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {u.whoShare.name || "Unknown User"} {t("to")}{" "}
                      {u.toWho.name || "Unknown User"}
                    </Text>
                    <Text style={styles.placeType} numberOfLines={1}></Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!query ? (
          nearbyUsers.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.centerText}>{t("no_nearby")}</Text>
            </View>
          ) : (
            nearbyUsers.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() =>
                  router.push({
                    pathname: "/(main)/(share)/location/view",
                    params: {
                      userId: u.id,
                    },
                  })
                }
              >
                <View style={styles.card}>
                  <View style={styles.iconWrapper}>
                    <AvatarImg src={u.avatar_url} />
                  </View>
                  <View style={styles.textWrapper}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {u.name || "Unknown User"}
                    </Text>
                    <Text style={styles.placeType} numberOfLines={1}>
                      {u.email}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : results === null ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#e3e3e3" />
            <Text style={styles.centerText}>{t("searching")}</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.centerText}>{t("no_results")}</Text>
          </View>
        ) : (
          results.map((u) => (
            <TouchableOpacity
              key={u.id}
              onPress={() =>
                router.push({
                  pathname: "/(main)/(share)/location/view",
                  params: {
                    userId: u.id,
                  },
                })
              }
            >
              <View style={styles.card}>
                <View style={styles.iconWrapper}>
                  <AvatarImg src={u.avatar_url} />
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {u.name || "Unknown User"}
                  </Text>
                  <Text style={styles.placeType} numberOfLines={1}>
                    {u.email}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
});
