import { Button } from "@/shared/components/ui";

export function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lumen</h1>
      <p className="text-gray-600 mb-8">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
