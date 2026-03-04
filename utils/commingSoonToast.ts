import { createTranslator } from "@/i18n";
import { Platform, ToastAndroid } from "react-native";

const { t } = createTranslator("main");

export function showCommingSoonToast(message?: string) {
  if (Platform.OS !== "android") return;
  ToastAndroid.show(message ?? t("toasts.comingSoon"), ToastAndroid.SHORT);
}
