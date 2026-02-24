import { useHapticSettings } from "@/contexts/HapticSettingsContext";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    Platform,
    TouchableOpacity,
    TouchableOpacityProps,
    Vibration,
} from "react-native";

export type HapticTouchableProps = TouchableOpacityProps & {
  /** disable haptic feedback for this touchable */
  disableHaptic?: boolean;
};

export const HapticTouchable: React.FC<HapticTouchableProps> = ({
  disableHaptic,
  onPress,
  ...rest
}) => {
  const { vibration } = useHapticSettings();
  const enabled = vibration.force > 0;
  const impactStyle =
    vibration.force >= 3
      ? Haptics.ImpactFeedbackStyle.Heavy
      : vibration.force === 2
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
  const duration = vibration.duration;

  const handlePress = (e: any) => {
    if (!disableHaptic && enabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(impactStyle).catch(() => {
          Vibration.vibrate(duration);
        });
      } else {
        Vibration.vibrate(duration);
      }
    }
    onPress?.(e);
  };

  return <TouchableOpacity {...rest} onPress={handlePress} />;
};
