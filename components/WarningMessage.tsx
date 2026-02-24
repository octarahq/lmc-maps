import { HapticTouchable as TouchableOpacity } from "@/components/HapticTouchable";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export type WarningButton = {
  label: string;
  action: () => void;
};

export type WarningMessageProps = {
  visible: boolean;
  onDismiss?: () => void;
  iconName?: string;
  title: string;
  description: string;
  buttons?: WarningButton[];
};

export function WarningMessage({
  visible,
  onDismiss,
  iconName = "warning",
  title,
  description,
  buttons = [],
}: WarningMessageProps) {
  const translateY = React.useRef(new Animated.Value(200)).current;
  const [localVisible, setLocalVisible] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setLocalVisible(true);
    }
    const config = visible
      ? {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }
      : {
          duration: 150,
          easing: Easing.bezier(0, 0, 0.2, 1),
        };

    Animated.timing(translateY, {
      toValue: visible ? 0 : 200,
      ...config,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setLocalVisible(false);
      }
    });
  }, [visible, translateY]);

  if (!localVisible) return null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => {
          if (buttons && buttons.length > 0) {
            buttons[0].action();
          } else {
            onDismiss?.();
          }
        }}
      />
      <View style={[styles.innerContainer, { justifyContent: "flex-end" }]}>
        <View style={styles.box}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <MaterialIcons
                name={iconName as any}
                size={32}
                color={Colors.dark.primary}
              />
            </View>
            <Text style={styles.headline}>{title}</Text>
            <View style={styles.bodyWrapper}>
              <Text style={styles.body}>{description}</Text>
            </View>
            {buttons.length > 0 && (
              <View style={styles.buttonGroup}>
                {buttons.map((btn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={
                      idx === 0 ? styles.buttonPrimary : styles.buttonSecondary
                    }
                    onPress={btn.action}
                  >
                    <Text
                      style={
                        idx === 0
                          ? styles.buttonPrimaryText
                          : styles.buttonSecondaryText
                      }
                    >
                      {btn.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  innerContainer: {
    alignItems: "center",
    paddingBottom: 32,
  },
  box: {
    backgroundColor: Colors.dark.background,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    overflow: "hidden",
    width: 480,
    maxWidth: "100%",
  },
  handleContainer: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 16,
    height: 64,
    width: 64,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary + "1A",
    borderColor: Colors.dark.primary + "33",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontFamily: "Material Icons",
    fontSize: 32,
    color: Colors.dark.primary,
  },
  headline: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  bodyWrapper: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
  },
  body: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    textAlign: "center",
  },
  bodyHighlight: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  bodySecondary: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 4,
  },
  buttonGroup: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
    paddingVertical: 16,
  },
  buttonPrimary: {
    height: 56,
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonSecondary: {
    height: 56,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    fontWeight: "600",
  },
});
