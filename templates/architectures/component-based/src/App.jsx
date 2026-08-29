import { AppProvider } from "@/providers/AppProvider";
import { MainLayout } from "@/layouts/MainLayout";
import { HomePage } from "@/pages/Home/Home";

export default function App() {
  return (
    <AppProvider>
      <MainLayout>
        <HomePage />
      </MainLayout>
    </AppProvider>
  );
}
