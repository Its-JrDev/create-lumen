import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/shared/components/ui";

export function HomePage() {
  return (
    <div className="text-center">
      <div className="d-flex justify-content-center gap-3 mb-4">
        <HugeiconsIcon icon={Sun01Icon} style={{ width: 32, height: 32 }} className="text-warning" />
        <HugeiconsIcon icon={Moon01Icon} style={{ width: 32, height: 32 }} className="text-primary" />
        <HugeiconsIcon icon={Github01Icon} style={{ width: 32, height: 32 }} className="text-dark" />
      </div>
      <h1 className="h1 fw-bold text-dark mb-4">Welcome to Lumen</h1>
      <p className="text-muted mb-5">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}