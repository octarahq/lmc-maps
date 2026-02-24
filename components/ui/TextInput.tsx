import { Colors } from "@/constants/theme";
import { useHapticSettings } from "@/contexts/HapticSettingsContext";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  Vibration,
} from "react-native";

export type TextFieldProps = TextInputProps & {
  placeholder?: string;
};

export function TextField({ style, placeholder, ...rest }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const { vibration } = useHapticSettings();
  const enabled = vibration.force > 0;
  const impactStyle =
    vibration.force >= 3
      ? Haptics.ImpactFeedbackStyle.Heavy
      : vibration.force === 2
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
  const duration = vibration.duration;

  return (
    <RNTextInput
      onFocus={() => {
        setFocused(true);
        if (enabled) {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(impactStyle).catch(() => {
              Vibration.vibrate(duration);
            });
          } else {
            Vibration.vibrate(duration);
          }
        }
      }}
      onBlur={() => setFocused(false)}
      style={[styles.input, focused && styles.focused, style]}
      placeholder={placeholder}
      placeholderTextColor={styles.placeholder.color}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 64,
    borderRadius: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    fontWeight: "500",
    backgroundColor: "#1e293b",
    color: "#fff",
    borderWidth: 0,
  },
  placeholder: {
    color: "rgba(255,255,255,0.5)",
  },
  focused: {
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
});
