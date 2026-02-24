import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { HapticSettingsProvider } from "../contexts/HapticSettingsContext";
import { PermissionsProvider } from "../contexts/PermissionsContext";
import { UserProvider } from "../contexts/UserContext";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

const STORAGE_KEY = "hasOnboarded";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const always = process.env.EXPO_PUBLIC_SHOW_ONBOARDING_ALWAYS === "true";

    if (always) {
      setShowOnboarding(true);
      setIsLoading(false);
      return;
    }

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!value) {
          setShowOnboarding(true);
        }
      })
      .catch((err) => console.warn("Failed to read onboarding state", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <PermissionsProvider>
      <HapticSettingsProvider>
        <UserProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack>
              {showOnboarding ? (
                <Stack.Screen
                  name="(onboarding)"
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              )}
              <Stack.Screen
                name="modal"
                options={{ presentation: "modal", title: "Modal" }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </UserProvider>
      </HapticSettingsProvider>
    </PermissionsProvider>
  );
}
