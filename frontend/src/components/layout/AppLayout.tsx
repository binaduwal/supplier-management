import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="min-h-svh">
      <Header />
      <main>
        <Outlet />
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
