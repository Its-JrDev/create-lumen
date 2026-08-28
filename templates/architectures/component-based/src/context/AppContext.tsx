import { useState, useEffect, type ReactNode } from "react";
import { AppContext, type AppContextValue } from "./app-context";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value: AppContextValue = { theme, setTheme };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}