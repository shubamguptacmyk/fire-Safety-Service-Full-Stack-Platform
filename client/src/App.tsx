import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Core & Auth Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import VerifyEmail from "@/pages/VerifyEmail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Catalog & Commerce Pages
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Search from "@/pages/Search";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Invoices from "@/pages/Invoices";
import Addresses from "@/pages/Addresses";

// B2B Quotations
import RequestQuote from "@/pages/RequestQuote";
import Quotes from "@/pages/Quotes";

// Equipment Registry & Services
import MyEquipment from "@/pages/MyEquipment";
import BookService from "@/pages/BookService";
import ServiceHistory from "@/pages/ServiceHistory";
import Services from "@/pages/Services";
import AMCService from "@/pages/services/AMCService";
import RefillingService from "@/pages/services/RefillingService";
import AuditService from "@/pages/services/AuditService";
import InstallationService from "@/pages/services/InstallationService";
import InspectionService from "@/pages/services/InspectionService";

// Content, Company & Compliance Pages
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Faq from "@/pages/Faq";
import Gallery from "@/pages/Gallery";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Terms from "@/pages/Terms";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Catalog & Browsing */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:category" element={<Products />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Public Services Info */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/amc" element={<AMCService />} />
        <Route path="/services/refilling" element={<RefillingService />} />
        <Route path="/services/fire-safety-audit" element={<AuditService />} />
        <Route path="/services/audit" element={<AuditService />} />
        <Route path="/services/installation" element={<InstallationService />} />
        <Route path="/services/inspection" element={<InspectionService />} />

        {/* B2B Quotation Flow */}
        <Route path="/request-quote" element={<RequestQuote />} />
        <Route path="/quotes/new" element={<RequestQuote />} />

        {/* Company & Knowledge Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Checkout Flow */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/my-equipment" element={<MyEquipment />} />
          <Route path="/book-service" element={<BookService />} />
          <Route path="/service-history" element={<ServiceHistory />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
