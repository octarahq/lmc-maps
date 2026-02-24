import { HapticTouchable } from "@/components/HapticTouchable";
import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import type { TouchableOpacityProps } from "react-native";
import { StyleSheet, Text, Vibration } from "react-native";

export type OnboardingButtonProps = TouchableOpacityProps & {
  title: string;
};

export function OnboardingButton({
  title,
  style,
  onPress,
  disabled,
  ...rest
}: OnboardingButtonProps) {
  const isDisabled = !!disabled;
  const background = isDisabled ? "#374151" : Colors.dark.primary;
  const color = useThemeColor({ dark: Colors.dark.text }, "text");

  const handlePress: TouchableOpacityProps["onPress"] = (e) => {
    if (isDisabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {
          Vibration.vibrate(50);
        },
      );
      return;
    }
    onPress?.(e);
  };

  return (
    <HapticTouchable
      style={[
        styles.button,
        { backgroundColor: background },
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      {...rest}
    >
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {title}
      </Text>
    </HapticTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
