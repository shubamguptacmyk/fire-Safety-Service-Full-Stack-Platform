import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  CreditCard,
  Tag,
  Wrench,
  Users,
  MessageSquare,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Camera,
  BarChart3,
  ShieldAlert,
  Settings,
  ArrowRight,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { catalogService } from "@/services/catalogService";
import { adminOrderService } from "@/services/adminOrderService";

interface OmnisearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavCommand {
  id: string;
  title: string;
  category: "Navigation" | "Product" | "Order";
  icon: any;
  to: string;
  badge?: string;
}

const STATIC_COMMANDS: NavCommand[] = [
  { id: "nav-dash", title: "Executive Dashboard", category: "Navigation", icon: LayoutDashboard, to: "/" },
  { id: "nav-cat", title: "Catalog, Equipment & Stock", category: "Navigation", icon: Package, to: "/catalog" },
  { id: "nav-ord", title: "Orders & B2B Commercial Quotes", category: "Navigation", icon: ShoppingBag, to: "/orders" },
  { id: "nav-inv", title: "GST Tax Invoices & Billing", category: "Navigation", icon: Receipt, to: "/invoices" },
  { id: "nav-pay", title: "Payment Gateways & Ledger", category: "Navigation", icon: CreditCard, to: "/payments" },
  { id: "nav-coup", title: "Promotional Discount Coupons", category: "Navigation", icon: Tag, to: "/coupons" },
  { id: "nav-serv", title: "AMC Contracts & Service Tickets", category: "Navigation", icon: Wrench, to: "/service" },
  { id: "nav-cust", title: "Customer Directory & 360", category: "Navigation", icon: Users, to: "/customers" },
  { id: "nav-rev", title: "Customer Reviews & Moderation", category: "Navigation", icon: MessageSquare, to: "/reviews" },
  { id: "nav-blog", title: "Blog & Safety Articles CMS", category: "Navigation", icon: FileText, to: "/blog" },
  { id: "nav-faq", title: "Frequently Asked Questions", category: "Navigation", icon: HelpCircle, to: "/faqs" },
  { id: "nav-ban", title: "Hero Banners & Campaign Strips", category: "Navigation", icon: ImageIcon, to: "/banners" },
  { id: "nav-gal", title: "Project Installation Gallery", category: "Navigation", icon: Camera, to: "/gallery" },
  { id: "nav-rep", title: "Business Reports & GST Reconciliation", category: "Navigation", icon: BarChart3, to: "/reports" },
  { id: "nav-aud", title: "Audit Trail & Security Logs", category: "Navigation", icon: ShieldAlert, to: "/audit-logs" },
  { id: "nav-set", title: "System & Compliance Settings", category: "Navigation", icon: Settings, to: "/settings" },
];

export default function OmnisearchModal({ isOpen, onClose }: OmnisearchModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [dynamicResults, setDynamicResults] = useState<NavCommand[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setDynamicResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard shortcut Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search on query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setDynamicResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [prodRes, orderRes] = await Promise.allSettled([
          catalogService.getProducts({ search: query, limit: 4 }),
          adminOrderService.listOrders({ search: query, limit: 4 }),
        ]);

        const extra: NavCommand[] = [];

        if (prodRes.status === "fulfilled" && prodRes.value.products) {
          prodRes.value.products.forEach((p) => {
            extra.push({
              id: `p-${p._id}`,
              title: `${p.name} (${p.SKU || "SKU"})`,
              category: "Product",
              icon: Package,
              to: "/catalog",
              badge: `₹${p.price.toLocaleString("en-IN")}`,
            });
          });
        }

        if (orderRes.status === "fulfilled" && orderRes.value.orders) {
          orderRes.value.orders.forEach((o) => {
            extra.push({
              id: `o-${o._id}`,
              title: `Order ${o.orderNumber} - ${o.customer?.name || "Customer"}`,
              category: "Order",
              icon: ShoppingBag,
              to: "/orders",
              badge: `₹${o.pricing?.grandTotal.toLocaleString("en-IN")}`,
            });
          });
        }

        setDynamicResults(extra);
      } catch {
        /* ignore */
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredNav = STATIC_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [...dynamicResults, ...filteredNav];

  function handleSelect(to: string) {
    onClose();
    navigate(to);
  }

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(allResults.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(allResults.length, 1));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(allResults[selectedIndex].to);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyNav}
      >
        <div className="relative border-b border-black/10 px-4 py-3.5 flex items-center gap-3">
          <Search className="w-5 h-5 text-steel" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Jump to section, product, or order... (Type to search)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 text-sm bg-transparent border-none outline-none text-ink placeholder:text-steel"
          />
          {searching && <Loader2 className="w-4 h-4 text-brand animate-spin" />}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-steel bg-paper border border-black/10 rounded">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 text-steel hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-black/5">
          {dynamicResults.length > 0 && (
            <div className="pb-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-steel block">
                Live Database Matches
              </span>
              <div className="mt-1 space-y-0.5">
                {dynamicResults.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.to)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                        isSelected ? "bg-brand text-white" : "hover:bg-paper text-ink"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-brand" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-white/20 text-white" : "bg-paper text-steel"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-steel block">
              Admin Navigation & Modules
            </span>
            <div className="mt-1 space-y-0.5">
              {filteredNav.map((cmd, idx) => {
                const actualIdx = dynamicResults.length + idx;
                const Icon = cmd.icon;
                const isSelected = selectedIndex === actualIdx;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.to)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                      isSelected ? "bg-brand text-white" : "hover:bg-paper text-ink"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{cmd.title}</span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-steel/50"}`} />
                  </button>
                );
              })}
              {filteredNav.length === 0 && dynamicResults.length === 0 && (
                <div className="py-6 text-center text-xs text-steel">
                  No matching admin views found for &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 py-2 bg-paper/60 border-t border-black/5 flex items-center justify-between text-[11px] text-steel">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-black/10 rounded font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-black/10 rounded font-mono">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-black/10 rounded font-mono">↵</kbd>
          </div>
          <span className="font-medium">AK Fire Safety Administrative Console</span>
        </div>
      </div>
    </div>
  );
}
