import React from "react";
import { Sun, Moon, Github } from "@hugeicons/react";
import { Button } from "@/components/ui";

export function HomePage() {
  return (
    <div className="text-center">
      <div className="flex justify-center gap-4 mb-6">
        <Sun className="w-8 h-8 text-yellow-500" />
        <Moon className="w-8 h-8 text-blue-500" />
        <Github className="w-8 h-8 text-gray-800" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Lumen</h1>
      <p className="text-gray-600 mb-8">
        Your React + Vite project is ready. Start building!
      </p>
      <Button>Get Started</Button>
    </div>
  );
}
