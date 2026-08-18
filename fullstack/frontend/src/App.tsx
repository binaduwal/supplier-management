import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SupplierDetailPage } from "./features/suppliers/pages/SupplierDetailPage";
import { SupplierListPage } from "./features/suppliers/pages/SupplierListPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/suppliers" replace />} />
        <Route path="/suppliers" element={<SupplierListPage />} />
        <Route path="/suppliers/:id" element={<SupplierDetailPage />} />
      </Route>
    </Routes>
  );
}
