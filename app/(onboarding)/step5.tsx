import { HapticTouchable as TouchableOpacity } from "@/components/HapticTouchable";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useUser } from "@/contexts/UserContext";
import { createTranslator } from "@/i18n";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const { t } = createTranslator("onboarding");

type PrivacyLevel = "total" | "necessary" | "limited" | "none";

export default function Step5() {
  const { privacy, setPrivacy } = useUser();
  const { showWarning, hideWarning } = usePermissions();
  const [level, setLevel] = useState<PrivacyLevel>(privacy);

  useEffect(() => {
    setLevel(privacy);
  }, [privacy]);

  const options: {
    key: PrivacyLevel;
    title: string;
    body: string;
    tag?: string;
  }[] = [
    {
      key: "total",
      title: t("step5.option_total"),
      body: t("step5.option_total_body"),
    },
    {
      key: "necessary",
      title: t("step5.option_necessary"),
      body: t("step5.option_necessary_body"),
    },
    {
      key: "limited",
      title: t("step5.option_limited"),
      body: t("step5.option_limited_body"),
    },
    {
      key: "none",
      title: t("step5.option_none"),
      body: t("step5.option_none_body"),
    },
  ];

  const selectLevel = (opt: PrivacyLevel) => {
    if (opt === "none") {
      showWarning({
        iconName: "warning",
        title: t("step5.option_none"),
        description: t("step5.none_warning"),
        buttons: [
          { label: t("dismiss"), action: hideWarning },
          {
            label: t("next"),
            action: () => {
              setLevel("none");
              setPrivacy("none");
              hideWarning();
            },
          },
        ],
      });
    } else {
      setLevel(opt);
      setPrivacy(opt);
    }
  };

  return (
    <ThemedView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.heading}>
            {t("step5.heading")}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t("step5.description")}
          </ThemedText>
        </View>
        <View style={styles.list}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.option,
                level === opt.key && { borderColor: Colors.dark.primary },
              ]}
              activeOpacity={0.8}
              onPress={() => selectLevel(opt.key)}
            >
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                {opt.tag && <Text style={styles.tag}>{opt.tag}</Text>}
                <Text style={styles.optionBody}>{opt.body}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  header: {
    paddingTop: 100,
    paddingBottom: 24,
  },
  heading: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 8,
  },
  description: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    lineHeight: 22,
  },
  list: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
    paddingVertical: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 16,
    backgroundColor: Colors.dark.background,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  tag: {
    color: Colors.dark.text,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  optionBody: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 4,
  },
});
