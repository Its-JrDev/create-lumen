import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { HomePage } from "@/features/home";

export default function App() {
  return (
    <ThemeProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg)",
        }}
      >
        <HomePage />
      </div>
    </ThemeProvider>
  );
}
