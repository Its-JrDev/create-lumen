import { Sun, Moon, GitBranch } from "lucide-react";
import { Button } from "@/shared/components/ui";

export function HomePage() {
  return (
    <div className="text-center">
      <div className="d-flex justify-content-center gap-3 mb-4">
        <Sun size={32} className="text-warning" />
        <Moon size={32} className="text-primary" />
        <GitBranch size={32} className="text-dark" />
      </div>
      <h1 className="h1 fw-bold text-dark mb-4">Welcome to Lumen</h1>
      <p className="text-muted mb-5">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}