import { createContext } from "react";

export interface AppContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
