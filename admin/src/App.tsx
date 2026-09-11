import { Routes, Route } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import OrdersAdmin from "@/pages/OrdersAdmin";
import ServicesAdmin from "@/pages/ServicesAdmin";
import CustomersAdmin from "@/pages/CustomersAdmin";
import ReportsAdmin from "@/pages/ReportsAdmin";
import SettingsAdmin from "@/pages/SettingsAdmin";
import ReviewsAdmin from "@/pages/ReviewsAdmin";
import BlogAdmin from "@/pages/BlogAdmin";
import FaqAdmin from "@/pages/FaqAdmin";
import BannersAdmin from "@/pages/BannersAdmin";
import GalleryAdmin from "@/pages/GalleryAdmin";
import PaymentsAdmin from "@/pages/PaymentsAdmin";
import InvoicesAdmin from "@/pages/InvoicesAdmin";
import CouponsAdmin from "@/pages/CouponsAdmin";
import AuditLogsAdmin from "@/pages/AuditLogsAdmin";
import AdminManagement from "@/pages/AdminManagement";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute permission="products.read" />}>
            <Route path="/catalog" element={<Catalog />} />
          </Route>
          <Route element={<ProtectedRoute permission="orders.read" />}>
            <Route path="/orders" element={<OrdersAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="invoices.read" />}>
            <Route path="/invoices" element={<InvoicesAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="payments.read" />}>
            <Route path="/payments" element={<PaymentsAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="coupons.read" />}>
            <Route path="/coupons" element={<CouponsAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="services.read" />}>
            <Route path="/service" element={<ServicesAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="customers.read" />}>
            <Route path="/customers" element={<CustomersAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="reports.read" />}>
            <Route path="/reports" element={<ReportsAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="settings.manage" />}>
            <Route path="/settings" element={<SettingsAdmin />} />
            <Route path="/reviews" element={<ReviewsAdmin />} />
            <Route path="/blog" element={<BlogAdmin />} />
            <Route path="/faqs" element={<FaqAdmin />} />
            <Route path="/banners" element={<BannersAdmin />} />
            <Route path="/gallery" element={<GalleryAdmin />} />
            <Route path="/audit-logs" element={<AuditLogsAdmin />} />
          </Route>
          <Route element={<ProtectedRoute permission="admins.read" />}>
            <Route path="/admins" element={<AdminManagement />} />
            <Route path="/admin-users" element={<AdminManagement />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
