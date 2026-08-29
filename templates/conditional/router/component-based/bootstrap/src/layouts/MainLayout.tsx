import { Outlet } from "react-router-dom";

export function MainLayout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="px-4 py-3 border-bottom">
        <h2 className="h5 fw-semibold mb-0">Lumen</h2>
      </header>
      <main className="flex-grow-1 p-4 d-flex align-items-center justify-content-center">
        <Outlet />
      </main>
      <footer className="px-4 py-3 border-top text-center text-muted">
        <p className="mb-0">Built with Lumen</p>
      </footer>
    </div>
  );
}