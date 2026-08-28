import { useState } from "react";
import { AppContext } from "./app-context";

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}