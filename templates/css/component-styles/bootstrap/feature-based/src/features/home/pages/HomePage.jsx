import { Button } from "@/shared/components/ui";

export function HomePage() {
  return (
    <div className="text-center">
      <h1 className="h1 fw-bold text-dark mb-4">Welcome to Lumen</h1>
      <p className="text-muted mb-5">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}