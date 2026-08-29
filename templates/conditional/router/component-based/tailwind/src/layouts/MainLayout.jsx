import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Lumen</h2>
      </header>
      <main className="flex-1 p-6 flex items-center justify-center">
        <Outlet />
      </main>
      <footer className="px-6 py-4 border-t text-center text-gray-500">
        <p>Built with Lumen</p>
      </footer>
    </div>
  );
}