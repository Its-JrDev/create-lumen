import { createContext } from "react";

// React Fast Refresh requires contexts to live in a separate file from
// components, so the AppProvider component exports from AppContext.tsx.
export const AppContext = createContext(null);