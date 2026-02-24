import React, { createContext, useContext, useState } from "react";

type PermissionKeys = "location" | "notifications" | "contacts";
export type Permissions = Record<PermissionKeys, boolean>;

type WarningConfig = {
  iconName?: string;
  title: string;
  description: string;
  buttons: { label: string; action: () => void }[];
} | null;

type ContextType = {
  permissions: Permissions;
  setPermission: (key: PermissionKeys, value: boolean) => void;
  warning: WarningConfig;
  showWarning: (config: WarningConfig) => void;
  hideWarning: () => void;
};

const defaultPerms: Permissions = {
  location: false,
  notifications: true,
  contacts: true,
};

const PermissionsContext = createContext<ContextType | undefined>(undefined);

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [permissions, setPermissions] = useState<Permissions>(defaultPerms);
  const [warning, setWarning] = useState<WarningConfig>(null);

  const setPermission = (key: PermissionKeys, value: boolean) => {
    setPermissions((p) => ({ ...p, [key]: value }));
  };

  const showWarning = (config: WarningConfig) => {
    setWarning(config);
  };
  const hideWarning = () => setWarning(null);

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        setPermission,
        warning,
        showWarning,
        hideWarning,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return ctx;
}
