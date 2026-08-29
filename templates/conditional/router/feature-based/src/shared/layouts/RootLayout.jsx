import { Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <Outlet />
    </div>
  );
}
