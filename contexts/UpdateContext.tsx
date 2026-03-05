import { checkForUpdates, ReleaseInfo } from "@/services/UpdateService";
import React from "react";

type UpdateContextValue = {
  hasUpdate: boolean;
  releaseInfo?: ReleaseInfo;
  dismissUpdate: () => void;
  checkUpdates: () => Promise<void>;
  isChecking: boolean;
};

const UpdateContext = React.createContext<UpdateContextValue | null>(null);

export function useUpdate() {
  const ctx = React.useContext(UpdateContext);
  if (!ctx) throw new Error("useUpdate must be used within UpdateProvider");
  return ctx;
}

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [hasUpdate, setHasUpdate] = React.useState(false);
  const [releaseInfo, setReleaseInfo] = React.useState<ReleaseInfo | undefined>(
    undefined,
  );
  const [isChecking, setIsChecking] = React.useState(false);
  const checkedRef = React.useRef(false);

  const dismissUpdate = React.useCallback(() => {
    setHasUpdate(false);
    setReleaseInfo(undefined);
  }, []);

  const checkUpdates = React.useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkForUpdates();
      if (result.isUpdateAvailable && result.releaseInfo) {
        setHasUpdate(true);
        setReleaseInfo(result.releaseInfo);
      }
    } catch {
    } finally {
      setIsChecking(false);
    }
  }, []);

  React.useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      checkUpdates();
    }
  }, [checkUpdates]);

  const value = React.useMemo(
    () => ({
      hasUpdate,
      releaseInfo,
      dismissUpdate,
      checkUpdates,
      isChecking,
    }),
    [hasUpdate, releaseInfo, dismissUpdate, checkUpdates, isChecking],
  );

  return (
    <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
  );
}

export default UpdateContext;
