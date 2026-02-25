import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { createTranslator } from "@/i18n";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";

const { t } = createTranslator("onboarding");

export default function Step2() {
  return (
    <ThemedView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headlineWrapper}>
            <ThemedText type="title" style={styles.headline}>
              {t("step2.efficiency")}{" "}
              <ThemedText style={styles.highlight}>
                {t("step2.redefined")}
              </ThemedText>
            </ThemedText>
          </View>

          <View style={styles.features}>
            {[
              {
                icon: "navigation",
                title: t("step2.feature1_title"),
                body: t("step2.feature1_body"),
              },
              {
                icon: "local-parking",
                title: t("step2.feature2_title"),
                body: t("step2.feature2_body"),
              },
              {
                icon: "train",
                title: t("step2.feature3_title"),
                body: t("step2.feature3_body"),
              },
            ].map((feat, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View style={styles.iconWrapper}>
                  <MaterialIcons
                    name={feat.icon as any}
                    size={24}
                    color={Colors.dark.primary}
                  />
                </View>
                <View style={styles.featureText}>
                  <ThemedText style={styles.featureTitle}>
                    {feat.title}
                  </ThemedText>
                  <ThemedText style={styles.featureBody}>
                    {feat.body}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    textAlign: "center",
  },
  headline: {
    color: Colors.dark.text,
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "left",
    marginBottom: 16,
  },
  body: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  container: {
    paddingBottom: 100,
  },
  headlineWrapper: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 16,
  },
  features: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(13,127,242,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  highlight: {
    color: Colors.dark.primary,
    fontWeight: "bold",
    fontSize: 32,
  },
  featureBody: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
});
