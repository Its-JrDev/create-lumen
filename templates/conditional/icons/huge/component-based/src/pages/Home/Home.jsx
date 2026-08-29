import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/common";

export function HomePage() {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <HugeiconsIcon icon={Sun01Icon} style={{ width: 32, height: 32, color: "#eab308" }} />
        <HugeiconsIcon icon={Moon01Icon} style={{ width: 32, height: 32, color: "#3b82f6" }} />
        <HugeiconsIcon icon={Github01Icon} style={{ width: 32, height: 32, color: "#1f2937" }} />
      </div>
      <h1
        style={{
          fontSize: "2.25rem",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "1rem",
        }}
      >
        Welcome to Lumen
      </h1>
      <p style={{ color: "#4b5563", marginBottom: "2rem" }}>
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}