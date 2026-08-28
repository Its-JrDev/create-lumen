import { HugeiconsIcon } from "@hugeicons/react";
import { Sun01Icon, Moon01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/common";

export function HomePage() {
  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-6">
        <HugeiconsIcon icon={Sun01Icon} className="w-8 h-8 text-yellow-500" />
        <HugeiconsIcon icon={Moon01Icon} className="w-8 h-8 text-blue-500" />
        <HugeiconsIcon icon={Github01Icon} className="w-8 h-8 text-gray-800" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lumen</h1>
      <p className="text-gray-600 mb-8">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
