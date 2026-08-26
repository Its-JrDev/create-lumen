import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}
