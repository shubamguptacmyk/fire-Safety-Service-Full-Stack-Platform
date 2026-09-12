import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-dark font-body antialiased overflow-x-hidden w-full">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-700 focus:text-white focus:rounded-md focus:shadow-md text-xs font-bold"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1 w-full min-w-0">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
