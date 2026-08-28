import { Button } from "@/components/common";

export function HomePage() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "1rem" }}>
        Welcome to Lumen
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
