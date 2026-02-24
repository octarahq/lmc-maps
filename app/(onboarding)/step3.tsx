import { HapticTouchable as TouchableOpacity } from "@/components/HapticTouchable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TextField } from "@/components/ui/TextInput";
import { Colors } from "@/constants/theme";
import { useUser } from "@/contexts/UserContext";
import { createTranslator } from "@/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const { t } = createTranslator("onboarding");

export default function Step3() {
  const { name: storedName, setName } = useUser();

  const [anon, setAnon] = useState(false);
  const [pressedAnon, setPressedAnon] = useState(false);
  const [localName, setLocalName] = useState("");

  const toggleAnon = () => {
    setAnon((v) => !v);
    if (!anon) {
      setLocalName("");
    }
  };

  useEffect(() => {
    if (storedName) {
      if (storedName === t("step3.traveler")) {
        setAnon(true);
        setLocalName("");
      } else {
        setAnon(false);
        setLocalName(storedName);
      }
    }
  }, [storedName]);

  useEffect(() => {
    if (anon) {
      const val = t("step3.traveler");
      if (val !== storedName) {
        setName(val);
      }
    } else {
      if (localName !== storedName) {
        setName(localName);
      }
    }
  }, [anon, localName, storedName, setName]);

  return (
    <ThemedView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headlineWrapper}>
          <ThemedText type="title" style={styles.headline}>
            {t("step3.title")}
          </ThemedText>
        </View>

        <View style={styles.bodyWrapper}>
          <ThemedText style={styles.body}>{t("step3.body")}</ThemedText>
        </View>

        <View style={styles.fieldSection}>
          <TextField
            placeholder={t("step3.enter_your_name")}
            value={localName}
            editable={!anon}
            onChangeText={(text) => {
              setLocalName(text);
            }}
          />
        </View>
        {(localName || anon) && (
          <View style={styles.greetingSection}>
            <ThemedText style={styles.greeting}>
              {t("step3.greeting", {
                name: anon ? t("step3.traveler") : localName,
              })}
            </ThemedText>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.toggleRow,
            pressedAnon && { borderColor: Colors.dark.primary + "4D" },
          ]}
          activeOpacity={0.75}
          onPress={toggleAnon}
          onPressIn={() => setPressedAnon(true)}
          onPressOut={() => setPressedAnon(false)}
        >
          <View style={styles.left}>
            <View style={[styles.circle, anon && styles.circleChecked]} />
            <Text style={styles.label}>{t("step3.stay_anonymously")}</Text>
          </View>
          <MaterialIcons
            name={!anon ? "visibility" : "visibility-off"}
            size={24}
            color={pressedAnon ? Colors.dark.primary : Colors.dark.icon}
            style={styles.iconPlaceholder}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  headlineWrapper: {
    paddingTop: 100,
    paddingBottom: 16,
  },
  headline: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "left",
  },
  bodyWrapper: {
    marginBottom: 24,
  },
  body: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    textAlign: "left",
  },
  fieldSection: {
    marginBottom: 24,
  },
  toggleRow: {
    marginBottom: 24,
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#475569",
    marginRight: 12,
    backgroundColor: "transparent",
  },
  circleChecked: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greeting: {
    color: "#fff",
    fontSize: 16,
    fontStyle: "italic",
  },
});
