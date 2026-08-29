import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Outlet />
    </div>
  );
}