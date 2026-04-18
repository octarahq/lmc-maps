import BottomSelect, { BottomSelectHandle } from "@/components/ui/BottomSelect";
import { UserProfile, useUser } from "@/contexts/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { createTranslator } from "@/i18n";
import { telemetryNavigationStart } from "@/services/TelemetryService";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

function SettingsSection({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    description: string;
    onValueChange?: (value: boolean) => void;
    onClick?: () => void;
  }[];
}) {
  return (
    <View style={{ width: "100%", marginTop: 16 }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 2,
          color: "#64748b",
          marginBottom: 16,
          paddingHorizontal: 8,
        }}
      >
        {title}
      </Text>

      <View
        style={{
          backgroundColor: "#1a2530",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Pressable
              onPress={item.onClick}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialIcons name={item.icon} size={20} color="#0d7ff2" />
                </View>
                <View>
                  <Text
                    style={{ color: "#fff", fontSize: 14, fontWeight: "500" }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ color: "#64748b", fontSize: 12 }}>
                    {item.description}
                  </Text>
                </View>
              </View>
              {item.onValueChange ? (
                <Switch
                  value
                  onValueChange={item.onValueChange}
                  trackColor={{ false: "#334155", true: "#0d7ff2" }}
                  thumbColor="#fff"
                />
              ) : (
                <MaterialIcons name="chevron-right" size={20} color="#64748b" />
              )}
            </Pressable>

            {index < items.length - 1 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  marginHorizontal: 16,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = createTranslator("settings");
  const { isLoading } = useAuth();
  const selectModeRef = useRef<BottomSelectHandle>(null);
  const selectVoiceRef = useRef<BottomSelectHandle>(null);
  const { settings, setSettings } = useUser();

  useEffect(() => {
    telemetryNavigationStart("settings_screen");
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0d7ff2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={{ padding: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0d7ff2" />
        </Pressable>
        <Text style={styles.title}>{t("title")}</Text>
      </View>

      <SettingsSection
        title={t("sections.0.title")}
        items={[
          {
            title: t("sections.0.settings.0.title"),
            description: t(`transportations_mode.${settings.favTransportMode}`),
            icon: "directions-car",
            onClick: () => {
              if (selectModeRef.current) selectModeRef.current.open();
            },
          },
          {
            title: t("sections.0.settings.1.title"),
            description: t("sections.0.settings.1.description"),
            icon: "volume-up",
            onClick: () => {
              if (selectVoiceRef.current) selectVoiceRef.current.open();
            },
          },
        ]}
      />

      <SettingsSection
        title={t("sections.1.title")}
        items={[
          {
            title: t("sections.1.settings.0.title"),
            description: t(`sections.1.settings.0.description`),
            icon: "share-location",
            onClick: () => {
              router.push("/share-location");
            },
          },
        ]}
      />

      <BottomSelect
        ref={selectModeRef}
        title="Choisir un mode de transport"
        items={[
          { key: "car", label: t("transportations_mode.car"), value: "car" },
          { key: "bike", label: t("transportations_mode.bike"), value: "bike" },
          { key: "walk", label: t("transportations_mode.walk"), value: "walk" },
          {
            key: "transit",
            label: t("transportations_mode.transit"),
            value: "transit",
          },
        ]}
        mode="single"
        initialSelected={settings.favTransportMode}
        onChange={(sel) =>
          setSettings({
            ...settings,
            favTransportMode:
              sel as UserProfile["settings"]["favTransportMode"],
          })
        }
      />
      <BottomSelect
        ref={selectVoiceRef}
        title="Choisir la methode de guidage par voix"
        items={[
          { key: "none", label: t("voice_guidance.none"), value: "none" },
          { key: "alert", label: t("voice_guidance.alert"), value: "alert" },
          { key: "all", label: t("voice_guidance.all"), value: "all" },
        ]}
        mode="single"
        initialSelected={settings.voice}
        onChange={(sel) =>
          setSettings({
            ...settings,
            voice: sel as UserProfile["settings"]["voice"],
          })
        }
      />
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
