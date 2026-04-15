import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => {
          router.back();
        }}
        style={{ padding: 8 }}
      >
        <MaterialIcons name="arrow-back" size={24} color="#0d7ff2" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
});
