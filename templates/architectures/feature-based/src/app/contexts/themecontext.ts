import { createContext } from "react";

export interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
