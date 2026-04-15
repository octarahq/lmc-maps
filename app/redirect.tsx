import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function RedirectPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log("[RedirectPage] Redirect route reached with params:", params);

    const timer = setTimeout(() => {
      console.log("[RedirectPage] Auto-redirecting to /(main)...");
      router.replace("/(main)");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, params]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 10 }}>
        Authentification Octara
      </Text>
      <Text style={{ color: "#666" }}>
        Connexion en cours, veuillez patienter...
      </Text>
    </View>
  );
}
