import { AvatarIcon } from "@/assets/icons";
import { OctaraService } from "@/services/OctaraService";
import { Image, ImageStyle } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface AvatarImgProps {
  size?: number;
  style?: StyleProp<ViewStyle | ImageStyle>;
  src?: string | null;
}

export function AvatarImg({ size = 40, style, src }: AvatarImgProps) {
  const [token, setToken] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    OctaraService.getAccessToken().then(setToken);
  }, []);

  const avatarUrl = src || "https://octara.xyz/api/v1/me/avatar";

  if (!token || hasError) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 2 },
          style as StyleProp<ViewStyle>,
        ]}
      >
        <AvatarIcon width={size * 0.6} height={size * 0.6} color={"#fff"} />
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
