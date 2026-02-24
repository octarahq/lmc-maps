import { useHapticSettings } from "@/contexts/HapticSettingsContext";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  const { vibration } = useHapticSettings();
  const enabled = vibration.force > 0;
  const impactStyle =
    vibration.force >= 3
      ? Haptics.ImpactFeedbackStyle.Heavy
      : vibration.force === 2
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (enabled && process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(impactStyle);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
