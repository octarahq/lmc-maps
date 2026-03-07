import { AppLogoIcon } from "@/assets/icons";
import { Colors } from "@/constants/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import Constants from "expo-constants";
import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";
import { Slot, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import {
  StatusBar as NativeStatusBar,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticSettingsProvider } from "../contexts/HapticSettingsContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { UserProvider, useUser } from "../contexts/UserContext";

import ErrorBoundary from "@/components/ErrorBoundary";
import UpdateDialog from "@/components/UpdateDialog";
import { UpdateProvider } from "@/contexts/UpdateContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initTelemetry } from "@/services/TelemetryInit";
import { telemetryAppStart } from "@/services/TelemetryService";

export const unstable_settings = {};

function SplashScreenOverlay() {
  return (
    <View style={styles.splashContainer}>
      <View style={styles.logoContainer}>
        <AppLogoIcon width={60} height={60} />
      </View>
    </View>
  );
}

function InnerLayout() {
  useKeepAwake();

  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const { hasFinishedOnboarding, isLoading } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [navigationDone, setNavigationDone] = useState(false);
  const isMainRoute = pathname.startsWith("/(main)");
  const { privacy } = useUser();

  useEffect(() => {
    if (!isLoading && hasFinishedOnboarding) {
      try {
        initTelemetry(privacy);
        telemetryAppStart({
          timestamp: Date.now(),
          user_anonymous: !hasFinishedOnboarding,
        });
      } catch {}
    }
  }, [isLoading, hasFinishedOnboarding, privacy]);

  useEffect(() => {
    if (isLoading) return;

    const alwaysShowOnboarding =
      process.env.EXPO_PUBLIC_SHOW_ONBOARDING_ALWAYS === "true";

    if (alwaysShowOnboarding) {
      if (!pathname.startsWith("/(onboarding)")) {
        router.replace("/(onboarding)/step1");
        setNavigationDone(true);
      }
      return;
    }

    if (hasFinishedOnboarding) {
      if (pathname.startsWith("/(onboarding)")) {
        router.replace("/(main)");
        setNavigationDone(true);
      }

      setNavigationDone(true);
      return;
    }

    const isOnboardingStep = [
      "/step1",
      "/step2",
      "/step3",
      "/step4",
      "/step5",
    ].some((step) => pathname.includes(step));

    if (!isOnboardingStep) {
      router.replace("/(onboarding)/step1");
      setNavigationDone(true);
    } else {
      setNavigationDone(true);
    }
  }, [hasFinishedOnboarding, pathname, router, isLoading]);

  useEffect(() => {
    if (!isLoading && navigationDone) {
      setTimeout(() => setShowSplash(false), 300);
    }
  }, [isLoading, navigationDone]);

  useEffect(() => {
    const bgColor =
      colorScheme === "dark"
        ? Colors.dark.backgroundDark
        : Colors.light.backgroundLight;
    SystemUI.setBackgroundColorAsync(bgColor).catch(() => {});
    NativeStatusBar.setHidden(true, "none");

    if (Platform.OS === "android") {
      const edgeToEdgeEnabled = Boolean(
        (Constants.expoConfig &&
          Constants.expoConfig.android &&
          Constants.expoConfig.android.edgeToEdgeEnabled) ||
        (Constants.manifest &&
          Constants.manifest.android &&
          Constants.manifest.android.edgeToEdgeEnabled),
      );

      NativeStatusBar.setTranslucent(true);
      NativeStatusBar.setBackgroundColor("transparent", true);
      if (!edgeToEdgeEnabled) {
        NavigationBar.setPositionAsync("absolute").catch(() => {});
        NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
        NavigationBar.setVisibilityAsync("hidden").catch(() => {});
        NavigationBar.setBackgroundColorAsync(bgColor).catch(() => {});
        NavigationBar.setButtonStyleAsync(
          colorScheme === "dark" ? "light" : "dark",
        ).catch(() => {});
      }
    }
  }, [colorScheme, pathname]);

  return (
    <>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {isMainRoute ? (
          <View
            style={[
              styles.safeArea,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? Colors.dark.backgroundDark
                    : Colors.light.backgroundLight,
              },
            ]}
          >
            <View style={styles.slotContainer}>
              <Slot />
            </View>
          </View>
        ) : (
          <SafeAreaView
            style={[
              styles.safeArea,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? Colors.dark.backgroundDark
                    : Colors.light.backgroundLight,
              },
            ]}
            edges={["top", "bottom"]}
          >
            <View style={styles.slotContainer}>
              <Slot />
            </View>
          </SafeAreaView>
        )}
        <StatusBar hidden style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
      <UpdateDialog />
      {showSplash && <SplashScreenOverlay />}
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <PermissionsProvider>
        <HapticSettingsProvider>
          <UserProvider>
            <UpdateProvider>
              <InnerLayout />
            </UpdateProvider>
          </UserProvider>
        </HapticSettingsProvider>
      </PermissionsProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  slotContainer: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
