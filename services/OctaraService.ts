import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const CLIENT_ID = process.env.EXPO_PUBLIC_OCTARA_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_OCTARA_CLIENT_SECRET;
const REDIRECT_URI = Linking.createURL("redirect");

const AUTH_URL = "https://octara.xyz/api/oauth/authorize";
const TOKEN_URL = "https://octara.xyz/api/oauth/token";
const API_BASE_URL = "https://octara.xyz/api/v1";

WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = "octara_access_token";

export type OctaraUser = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
};

export class OctaraService {
  static getAuthorizationUrl(): string {
    const scopes = "read:profile read:email share:location";
    const url = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI,
    )}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    return url;
  }

  static async login(): Promise<string | null> {
    try {
      const authUrl = this.getAuthorizationUrl();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI,
      );

      if (result.type === "success") {
        const { url } = result;
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string;

        if (code) {
          return await this.exchangeCodeForToken(code);
        } else {
          console.error("[OctaraService] No code found in redirect URL");
        }
      } else {
        console.log(
          "[OctaraService] WebBrowser dismissed or failed with type:",
          result.type,
        );
      }
    } catch (error) {
      console.error("[OctaraService] Login error:", error);
    }

    return null;
  }

  static async exchangeCodeForToken(code: string): Promise<string | null> {
    try {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
        return data.access_token;
      } else {
        console.error("[OctaraService] No access token in response:", data);
      }
    } catch (error) {
      console.error(
        "[OctaraService] Failed to exchange code for token:",
        error,
      );
    }

    return null;
  }

  static async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  }

  static async getCurrentUser(): Promise<OctaraUser | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.user) {
        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar_url: data.user.avatarUrl,
        };
      }
    } catch (error) {
      console.error("[OctaraService] Failed to fetch current user:", error);
    }

    return null;
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  static getWebSocketUrl(token: string, role: "sharer" | "viewer") {
    return `wss://octara.xyz/websocket/v1/user/location?token=${token}&role=${role}`;
  }

  static async searchUsers(query: string): Promise<OctaraUser[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: `${API_BASE_URL}/users/${user.id}/avatar`,
      }));
    } catch (error) {
      console.error("[OctaraService] Failed to search users:", error);
    }

    return [];
  }

  static async fetchNearbyUsers(): Promise<OctaraUser[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/me/nearby`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return data.nearby.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: `${API_BASE_URL}/users/${user.id}/avatar`,
      }));
    } catch (error) {
      console.error("[OctaraService] Failed to fetch nearby users:", error);
    }

    return [];
  }

  static async shareLocationWithUser(
    targetUserId: string,
    durationHours: number,
  ): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(`https://octara.xyz/api/location/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId, durationHours }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} - ${errorText}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error("[OctaraService] Failed to share location:", error);
    }
    return false;
  }

  static async stopSharingLocation(targetUserId: string): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch(
        `https://octara.xyz/api/location/share?targetUserId=${targetUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error("[OctaraService] Failed to stop sharing location:", error);
      return false;
    }
  }

  static async fetchTargetedLocationSharingUsers(userId?: string): Promise<
    {
      expiresAt: string;
      id: string;
      toWho: {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string;
      };
      whoShare: {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string;
      };
    }[]
  > {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch(
        `https://octara.xyz/api/location/share${userId ? `?userId=${userId}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return data.shares;
    } catch (error) {
      console.error(
        "[OctaraService] Failed to fetch targeted location sharing users:",
        error,
      );
    }

    return [];
  }
}
