import { WarningMessage } from "@/components/WarningMessage";
import { useUser } from "@/contexts/UserContext";
import { createTranslator } from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { LayoutAnimation, Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { usePermissions } from "../../contexts/PermissionsContext";
import { OnboardingButton } from "./_components/button";
import { PageIndicators } from "./_components/page-indicators";

const ROUTES = ["step1", "step2", "step3", "step4", "step5"] as const;
const STORAGE_KEY = "hasOnboarded";

function InnerLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = ROUTES.findIndex((route) => pathname.endsWith(route));
  const validIndex = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [validIndex]);

  const { permissions, warning, showWarning, hideWarning } = usePermissions();
  const { name } = useUser();
  const [lastWarning, setLastWarning] = React.useState(warning);

  React.useEffect(() => {
    if (warning) {
      setLastWarning(warning);
    }
  }, [warning]);

  const goNext = async () => {
    if (validIndex === 2) {
      if (!name) {
        showWarning({
          iconName: "warning",
          title: t("step3_required_title"),
          description: t("step3_required"),
          buttons: [
            {
              label: t("dismiss"),
              action: hideWarning,
            },
          ],
        });
        return;
      }
    }
    if (validIndex === ROUTES.length - 1) {
      if (!permissions.location) {
        showWarning({
          iconName: "warning",
          title: t("step4.warning_missing_title"),
          description: t("step4.warning_missing"),
          buttons: [
            {
              label: t("dismiss"),
              action: hideWarning,
            },
            {
              label: t("next"),
              action: async () => {
                hideWarning();
                try {
                  await AsyncStorage.setItem(STORAGE_KEY, "true");
                } catch {}
                router.replace("/");
              },
            },
          ],
        });
        return;
      }
      const all = Object.values(permissions).every(Boolean);
      if (!all) {
        showWarning({
          iconName: "warning",
          title: t("step4.warning_partial_title"),
          description: t("step4.warning_partial"),
          buttons: [
            {
              label: t("dismiss"),
              action: hideWarning,
            },
            {
              label: t("next"),
              action: async () => {
                hideWarning();
                try {
                  await AsyncStorage.setItem(STORAGE_KEY, "true");
                } catch {}
                router.replace("/");
              },
            },
          ],
        });
        return;
      }
    }

    if (validIndex < ROUTES.length - 1) {
      router.push(`./${ROUTES[validIndex + 1]}`);
    } else {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
      } catch {}
      router.replace("/");
    }
  };

  const { t } = createTranslator("onboarding");

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack>
          <Stack.Screen name="step1" options={{ headerShown: false }} />
          <Stack.Screen name="step2" options={{ headerShown: false }} />
          <Stack.Screen name="step3" options={{ headerShown: false }} />
          <Stack.Screen name="step4" options={{ headerShown: false }} />
          <Stack.Screen name="step5" options={{ headerShown: false }} />
        </Stack>
        <View style={styles.footer} pointerEvents="box-none">
          <PageIndicators total={ROUTES.length} current={validIndex} />
          <OnboardingButton
            title={
              validIndex === ROUTES.length - 1 ? t("get_started") : t("next")
            }
            onPress={goNext}
            disabled={validIndex === 2 && !name}
          />
        </View>

        {lastWarning && (
          <WarningMessage
            visible={!!warning}
            iconName={lastWarning.iconName}
            title={lastWarning.title}
            description={lastWarning.description}
            buttons={lastWarning.buttons}
            onDismiss={hideWarning}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

export default function OnboardingLayout() {
  return <InnerLayout />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    backgroundColor: "transparent",
    zIndex: 10,
  },
});
