import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type ThemeContextValue } from "../contexts/themecontext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") ?? "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme =
      theme === "dark" ? "dark" : "light";
  }, [theme]);

  const value: ThemeContextValue = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
