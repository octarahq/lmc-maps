import { HapticTouchable } from "@/components/HapticTouchable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";
import { createTranslator, setLanguage as setI18nLanguage } from "@/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { HeroIcon } from "./_components/hero-icon";

const { t } = createTranslator("onboarding");

export default function Step1() {
  const { language, setLanguage } = useUser();
  const [showMenu, setShowMenu] = useState(false);

  const changeLang = async (lng: string) => {
    await setI18nLanguage(lng);

    setLanguage(lng);
    setShowMenu(false);
  };

  return (
    <ThemedView style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.langWrapper}>
          <HapticTouchable
            style={styles.langButton}
            onPress={() => setShowMenu((v: boolean) => !v)}
          >
            <MaterialIcons
              name="language"
              size={18}
              color="white"
              style={{ marginRight: 6 }}
            />
            <ThemedText style={styles.langButtonText}>
              {language === "en" ? t("lang_en") : t("lang_fr")}
            </ThemedText>
            <MaterialIcons
              name={showMenu ? "expand-less" : "expand-more"}
              size={18}
              color="white"
              style={{ marginLeft: 6 }}
            />
          </HapticTouchable>
          {showMenu && (
            <View style={styles.langMenu}>
              <HapticTouchable onPress={() => changeLang("en")}>
                <ThemedText style={styles.langMenuItem}>
                  {t("lang_en")}
                </ThemedText>
              </HapticTouchable>
              <HapticTouchable onPress={() => changeLang("fr")}>
                <ThemedText style={styles.langMenuItem}>
                  {t("lang_fr")}
                </ThemedText>
              </HapticTouchable>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <HeroIcon />

        <View style={styles.headlineContainer}>
          <ThemedText type="title" style={styles.headline}>
            {t("step1.welcome_title")}
          </ThemedText>
        </View>

        <View style={styles.bodyContainer}>
          <ThemedText style={styles.body}>{t("step1.welcome_body")}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    textAlign: "center",
    marginTop: 64,
    zIndex: 1,
  },
  headlineContainer: {
    maxWidth: 320,
    paddingBottom: 16,
  },
  headline: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 36,
    textAlign: "center",
  },
  bodyContainer: {
    maxWidth: 280,
    paddingBottom: 24,
  },
  body: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    textAlign: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingTop: 24,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    zIndex: 10,
  },
  langWrapper: {
    position: "relative",
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  langButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  langMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,1)",
    borderRadius: 8,
    padding: 8,
    zIndex: 20,
  },
  langMenuItem: {
    color: "white",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
});
