import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

type AppSettingsContextType = {
    localCalculations: boolean;
    setLocalCalculations: Dispatch<SetStateAction<boolean>>;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a AppSettingsProvider");
  }
  return context;
};

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
    const [localCalculations, setLocalCalculations] = useState(false);

    const value: AppSettingsContextType = {
        localCalculations,
        setLocalCalculations,
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}