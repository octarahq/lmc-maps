import { AvatarIcon } from "@/assets/icons";
import { OctaraService } from "@/services/OctaraService";
import { Image, ImageStyle } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface AvatarImgProps {
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
}

export function AvatarImg({ size = 40, style }: AvatarImgProps) {
  const [token, setToken] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    OctaraService.getAccessToken().then(setToken);
  }, []);

  const avatarUrl = "https://octara.xyz/api/v1/me/avatar";

  if (!token || hasError) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
          style as StyleProp<ViewStyle>,
        ]}
      >
        <AvatarIcon width={size * 0.6} height={size * 0.6} />
      </View>
    );
  }

  return (
    <Image
      source={{
        uri: avatarUrl,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style as StyleProp<ImageStyle>,
      ]}
      contentFit="cover"
      transition={200}
      onError={() => {
        console.log(
          "[AvatarImg] Failed to load avatar image, falling back to icon",
        );
        setHasError(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
