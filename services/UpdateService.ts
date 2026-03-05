import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";

const GITHUB_API_URL =
  "https://api.github.com/repos/the-lmc-group/lmc-maps/releases/latest";

export interface ReleaseInfo {
  tag_name: string;
  name: string;
  body: string;
  prerelease: boolean;
  assets: {
    name: string;
    browser_download_url: string;
    content_type: string;
  }[];
}

export interface UpdateInfo {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseInfo?: ReleaseInfo;
}

const getCurrentVersion = (): string => {
  try {
    return Constants.expoConfig?.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
};

const parseVersion = (version: string): number[] => {
  return version
    .split(".")
    .map((v) => {
      const match = v.match(/^\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .slice(0, 3);
};

export const compareVersions = (
  current: string,
  latest: string,
): "update" | "same" | "downgrade" => {
  const curr = parseVersion(current);
  const lat = parseVersion(latest);

  for (let i = 0; i < Math.max(curr.length, lat.length); i++) {
    const c = curr[i] || 0;
    const l = lat[i] || 0;

    if (l > c) return "update";
    if (l < c) return "downgrade";
  }

  return "same";
};

export const checkForUpdates = async (): Promise<UpdateInfo> => {
  const currentVersion = getCurrentVersion();

  try {
    const response = await fetch(GITHUB_API_URL, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return {
        isUpdateAvailable: false,
        currentVersion,
        latestVersion: currentVersion,
      };
    }

    const releaseInfo: ReleaseInfo = await response.json();
    const latestVersion = releaseInfo.tag_name.replace(/^Beta-|^v/, "");

    const comparison = compareVersions(currentVersion, latestVersion);
    const isUpdateAvailable = comparison === "update";

    return {
      isUpdateAvailable,
      currentVersion,
      latestVersion,
      releaseInfo: isUpdateAvailable ? releaseInfo : undefined,
    };
  } catch {
    return {
      isUpdateAvailable: false,
      currentVersion,
      latestVersion: currentVersion,
    };
  }
};

export const downloadAndInstallAPK = async (
  downloadUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> => {
  if (Platform.OS !== "android") {
    throw new Error("APK installation is only supported on Android");
  }

  try {
    const filename = downloadUrl.split("/").pop() || "app.apk";
    let cacheDir =
      FileSystem.cacheDirectory || FileSystem.documentDirectory || "";

    if (!cacheDir || cacheDir === "undefined" || cacheDir === "null") {
      cacheDir = FileSystem.documentDirectory || "";
    }

    const basePath = cacheDir.endsWith("/") ? cacheDir : cacheDir + "/";
    const downloadPath = `${basePath}${filename}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadUrl,
      downloadPath,
      {},
      (downloadProgress) => {
        if (onProgress && downloadProgress.totalBytesExpectedToWrite > 0) {
          const prog =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          onProgress(prog);
        }
      },
    );

    const downloadResult = await downloadResumable.downloadAsync();
    if (!downloadResult) {
      throw new Error("Download failed: no result returned");
    }

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status ${downloadResult.status}`);
    }

    const fileUri = downloadResult.uri || downloadPath;

    const contentUri = await FileSystem.getContentUriAsync(fileUri);

    await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: contentUri,
      flags: 1,
      type: "application/vnd.android.package-archive",
    });
  } catch (error) {
    throw error;
  }
};
