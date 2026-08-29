import { Button } from "@/shared/components/ui";

export function HomePage() {
  return (
    <div style={{ textAlign: "center" }}>
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