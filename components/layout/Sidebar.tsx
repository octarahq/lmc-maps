import {
  AvatarIcon,
  BookmarkIcon,
  CloseIcon,
  HistoryIcon,
  LogoutIcon,
  SettingsIcon,
} from "@/assets/icons";
import { AvatarImg } from "@/components/AvatarImg";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated";

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
}

export function Sidebar({ isVisible, onClose }: SidebarProps) {
  const { user, logout, login } = useAuth();
  const router = useRouter();

  if (!isVisible) return null;

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleLogin = async () => {
    await login();
    onClose();
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Guest";

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInLeft.duration(300)}
          exiting={SlideOutLeft.duration(300)}
          style={styles.sidebar}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <CloseIcon
                  width={24}
                  height={24}
                  color="rgba(255,255,255,0.5)"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.profileSection}>
                <AvatarImg size={64} />
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userEmail}>
                  {user?.email || "Connectez-vous pour plus de fonctionnalités"}
                </Text>
              </View>

              <View style={styles.navContainer}>
                <TouchableOpacity
                  style={[styles.navItem]}
                  onPress={() => handleNavigation("/(main)/settings")}
                >
                  <SettingsIcon
                    width={24}
                    height={24}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={[styles.navText]}>Paramètres</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    onClose();
                    router.push("/(main)/trip_history");
                  }}
                >
                  <HistoryIcon
                    width={24}
                    height={24}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.navText}>Historique des trajets</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navItem}
                  onPress={() => {
                    onClose();
                    router.push("/(main)/(search)/search?tab=saved");
                  }}
                >
                  <BookmarkIcon
                    width={24}
                    height={24}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.navText}>Lieux enregistrés</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={user?.email ? handleLogout : handleLogin}
              >
                {user?.email ? (
                  <LogoutIcon width={24} height={24} color="#ff6b6b" />
                ) : (
                  <AvatarIcon width={24} height={24} color="#0d7ff2" />
                )}
                <Text
                  style={{
                    ...styles.logoutText,
                    color: user?.email ? "#ff6b6b" : "#0d7ff2",
                  }}
                >
                  {user?.email ? "Déconnexion" : "Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebar: {
    width: 320,
    height: "100%",
    backgroundColor: "#101922",
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: 8,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  userEmail: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  badgeContainer: {
    marginTop: 12,
    flexDirection: "row",
  },
  badge: {
    backgroundColor: "rgba(13,127,242,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(13,127,242,0.3)",
  },
  badgeText: {
    color: "#0d7ff2",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  navContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 16,
  },
  navText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    marginTop: "auto",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  versionText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 16,
    paddingLeft: 4,
  },
});
