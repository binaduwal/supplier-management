import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="app-shell">
      <a className="sr-only" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
