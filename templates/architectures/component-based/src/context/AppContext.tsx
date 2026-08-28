import { useState, useEffect } from "react";
import { AppContext } from "./app-context";

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}