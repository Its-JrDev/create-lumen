import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppContext } from "./appcontext";

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") ?? "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme =
      theme === "dark" ? "dark" : "light";
  }, [theme]);

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
