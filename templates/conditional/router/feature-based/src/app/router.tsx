import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "@/features/home/pages/HomePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
