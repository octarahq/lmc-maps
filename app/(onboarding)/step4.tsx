import { HapticTouchable as TouchableOpacity } from "@/components/HapticTouchable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WarningMessage } from "@/components/WarningMessage";
import { Colors } from "@/constants/theme";
import { createTranslator } from "@/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { usePermissions } from "../../contexts/PermissionsContext";

const { t } = createTranslator("onboarding");

export default function Step4() {
  const {
    permissions,
    setPermission,
    warning,
    locationAccuracy,
    setLocationAccuracy,
  } = usePermissions();
  const [pressed, setPressed] = useState({
    location: false,
    notifications: false,
    contacts: false,
  });

  useEffect(() => {
    (async () => {
      const { status, granted } =
        await Location.getForegroundPermissionsAsync();
      if (status === "granted" && granted) {
        setPermission("location", true);
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          if (pos.coords.accuracy && pos.coords.accuracy <= 30) {
            setLocationAccuracy("high");
          } else {
            setLocationAccuracy("low");
          }
        } catch {
          setLocationAccuracy("low");
        }
      }
    })();
  }, [setPermission]);

  const toggle = async (key: keyof typeof permissions) => {
    if (key === "location") {
      if (permissions.location) {
        setPermission("location", false);
        setLocationAccuracy("none");
      } else {
        const { status, granted } =
          await Location.requestForegroundPermissionsAsync();
        if (status === "granted" && granted) {
          try {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            if (pos.coords.accuracy && pos.coords.accuracy <= 30) {
              setLocationAccuracy("high");
            } else {
              setLocationAccuracy("low");
            }
          } catch {
            setLocationAccuracy("low");
          }
          setPermission("location", true);
        } else {
          setPermission("location", false);
          setLocationAccuracy("none");
        }
      }
    } else {
      setPermission(key, !permissions[key]);
    }
  };

  const onPressIn = (key: keyof typeof permissions) => {
    setPressed((p) => ({ ...p, [key]: true }));
  };
  const onPressOut = (key: keyof typeof permissions) => {
    setPressed((p) => ({ ...p, [key]: false }));
  };

  const items: {
    key: keyof typeof permissions;
    icon: string;
    title: string;
    body: string;
  }[] = [
    {
      key: "location",
      icon: "location-on",
      title: t("step4.location_title"),
      body: t("step4.location_body"),
    },
    {
      key: "notifications",
      icon: "notifications",
      title: t("step4.notifications_title"),
      body: t("step4.notifications_body"),
    },
    {
      key: "contacts",
      icon: "contacts",
      title: t("step4.contacts_title"),
      body: t("step4.contacts_body"),
    },
  ];

  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.heading}>
              {t("step4.heading")}
            </ThemedText>
            <ThemedText style={styles.description}>
              {t("step4.description")}
            </ThemedText>
          </View>

          <View style={styles.list}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.item,
                  pressed[item.key] && {
                    borderColor: Colors.dark.primary + "4D",
                  },
                  item.key === "location"
                    ? !permissions.location
                      ? { borderColor: "red", borderWidth: 2 }
                      : locationAccuracy === "low"
                        ? { borderColor: "yellow", borderWidth: 2 }
                        : { borderColor: Colors.dark.primary, borderWidth: 2 }
                    : permissions[item.key]
                      ? { borderColor: Colors.dark.primary, borderWidth: 2 }
                      : undefined,
                ]}
                activeOpacity={0.75}
                onPress={() => toggle(item.key)}
                onPressIn={() => onPressIn(item.key)}
                onPressOut={() => onPressOut(item.key)}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconCircle}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={28}
                      color={Colors.dark.primary}
                    />
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody}>{item.body}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      {warning && (
        <WarningMessage
          visible={true}
          iconName={warning.iconName}
          title={warning.title}
          description={warning.description}
          buttons={warning.buttons}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 32,
  },
  heading: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 8,
  },
  description: {
    color: "#a1a1a1",
    fontSize: 16,
    lineHeight: 22,
  },
  list: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#111111",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    justifyContent: "space-between",
    minHeight: 92,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.primary + "1A",
    borderWidth: 1,
    borderColor: Colors.dark.primary + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    flexDirection: "column",
    justifyContent: "center",
    flexShrink: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  itemBody: {
    color: "#a1a1a1",
    fontSize: 14,
    marginTop: 4,
    flexWrap: "wrap",
  },
});
