import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import React, { createContext, useContext, useEffect, useState } from "react";

export type PrivacyLevel = "total" | "necessary" | "limited" | "none";

export type UserProfile = {
  name: string;
  privacy: PrivacyLevel;
  language: string;
};

type ContextType = UserProfile & {
  setName: (name: string) => void;
  setPrivacy: (lvl: PrivacyLevel) => void;
  setLanguage: (lang: string) => void;
};

const STORAGE_KEY = "userProfile";

const UserContext = createContext<ContextType | undefined>(undefined);

function loadProfile(): Promise<UserProfile> {
  return AsyncStorage.getItem(STORAGE_KEY).then((v) => {
    if (v) {
      try {
        return JSON.parse(v) as UserProfile;
      } catch {}
    }
    return { name: "", privacy: "total", language: "" };
  });
}

function saveProfile(profile: UserProfile) {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    privacy: "total",
    language: Localization.getLocales()[0]?.languageCode || "en",
  });

  useEffect(() => {
    loadProfile().then((p) => {
      if (!p.language) {
        p.language = Localization.getLocales()[0]?.languageCode || "en";
      }
      setProfile(p);
    });
  }, []);

  const setName = React.useCallback((name: string) => {
    setProfile((p) => {
      const updated = { ...p, name };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const setPrivacy = React.useCallback((lvl: PrivacyLevel) => {
    setProfile((p) => {
      const updated = { ...p, privacy: lvl };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const setLanguage = React.useCallback((lang: string) => {
    setProfile((p) => {
      const updated = { ...p, language: lang };
      saveProfile(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    if (profile.language) {
      import("@/i18n").then(({ setLanguage }) => {
        setLanguage(profile.language);
      });
    }
  }, [profile.language]);

  return (
    <UserContext.Provider
      value={{ ...profile, setName, setPrivacy, setLanguage }}
    >
      <React.Fragment key={profile.language || "__init__"}>
        {children}
      </React.Fragment>
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within UserProvider");
  }
  return ctx;
}
