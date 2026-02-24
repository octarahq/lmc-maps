import React, { createContext, useContext, useState } from "react";

import defaults from "@/assets/config/default.json";

export type HapticSettings = {
  vibration: {
    duration: number;
    force: number;
  };
};

type ContextType = HapticSettings & {
  setSettings: React.Dispatch<React.SetStateAction<HapticSettings>>;
};

const HapticSettingsContext = createContext<ContextType | undefined>(undefined);

const fileDefaults: Partial<HapticSettings> = defaults as any;
const initialSettings: HapticSettings = {
  vibration: {
    duration: fileDefaults.vibration?.duration ?? 10,
    force: fileDefaults.vibration?.force ?? 1,
  },
};

export function HapticSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<HapticSettings>(initialSettings);
  return (
    <HapticSettingsContext.Provider
      value={{ vibration: settings.vibration, setSettings }}
    >
      {children}
    </HapticSettingsContext.Provider>
  );
}

export function useHapticSettings(): ContextType {
  const ctx = useContext(HapticSettingsContext);
  if (!ctx) {
    throw new Error(
      "useHapticSettings must be used within HapticSettingsProvider",
    );
  }
  return ctx;
}
