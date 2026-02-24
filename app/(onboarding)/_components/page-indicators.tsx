import { Colors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, View } from "react-native";

export type PageIndicatorsProps = {
  total: number;
  current: number;
};

export function PageIndicators({ total, current }: PageIndicatorsProps) {
  const activeColor = useThemeColor({ dark: Colors.dark.primary }, "text");
  const inactiveColor = "rgba(255,255,255,0.2)";

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === current ? activeColor : inactiveColor,
            },
            index === current && { width: 24 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
  },
});
