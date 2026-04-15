import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

const CLIENT_ID = process.env.EXPO_PUBLIC_OCTARA_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_OCTARA_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.EXPO_PUBLIC_OCTARA_REDIRECT_URI || Linking.createURL("redirect");

const AUTH_URL = "https://octara.xyz/api/oauth/authorize";
const TOKEN_URL = "https://octara.xyz/api/oauth/token";
const API_BASE_URL = "https://octara.xyz/api/v1";

// Ensure the auth session is completed properly particularly on web
WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = "octara_access_token";

export type OctaraUser = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
};

export class OctaraService {
  /**
   * Generates the authorization URL.
   */
  static getAuthorizationUrl(): string {
    const scopes = "read:profile read:email";
    const url = `${AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI,
    )}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    return url;
  }

  /**
   * Starts the OAuth flow using the WebBrowser and Linking.
   */
  static async login(): Promise<string | null> {
    try {
      const authUrl = this.getAuthorizationUrl();
      console.log("[OctaraService] Initiating login with URL:", authUrl);
      console.log("[OctaraService] Expected REDIRECT_URI:", REDIRECT_URI);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI,
      );
      console.log("[OctaraService] WebBrowser result:", result);

      if (result.type === "success") {
        const { url } = result;
        const parsed = Linking.parse(url);
        console.log("[OctaraService] Parsed redirect URL:", parsed);
        const code = parsed.queryParams?.code as string;

        if (code) {
          console.log(
            "[OctaraService] Authorization code found, exchanging for token...",
          );
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

  /**
   * Exchanges the authorization code for an access token.
   */
  static async exchangeCodeForToken(code: string): Promise<string | null> {
    try {
      console.log("[OctaraService] Exchanging code for token...");
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
        console.log("[OctaraService] Token exchanged successfully");
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

  /**
   * Retrieves the current access token from storage.
   */
  static async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  }

  /**
   * Fetches the authenticated user's profile.
   */
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

  /**
   * Logs out the user by removing the token.
   */
  static async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}
