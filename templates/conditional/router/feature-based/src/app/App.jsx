import { ThemeProvider } from "./providers/ThemeProvider";
import { AppRouter } from "./router";

export default function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}
