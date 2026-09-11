import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileCheck,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <footer className="bg-ink text-white/75 mt-16 border-t border-white/10">
      {/* Top Banner / Statutory Assurance */}
      <div className="border-b border-white/10 bg-black/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="w-4 h-4 text-amber shrink-0" />
            <span>Govt. Approved Licensed Agency &bull; Category &lsquo;A&rsquo; Directorate of Maharashtra Fire Services</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <FileCheck className="w-4 h-4 text-brand shrink-0" />
            <span>Form B Compliance Certification &bull; IS 15683 / IS 2190 / NBC Part IV Codes</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs leading-relaxed">
        {/* Brand & Corporate Contact */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded bg-brand flex items-center justify-center shadow-sm">
              <Flame className="w-4 h-4 text-amber" aria-hidden="true" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">AK FIRE SAFETY</span>
          </div>
          <p className="text-white/70 max-w-sm">
            Complete turnkey fire protection contracting, ISI certified equipment distribution,
            calibrated cylinder refilling, and statutory biannual Form B inspection services across
            Navi Mumbai, Thane, Taloja, and Maharashtra.
          </p>

          <div className="space-y-2 pt-1 text-white/80">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span>24/7 Hotline: +91 98000 00000 / +91 98200 12345</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand shrink-0" aria-hidden="true" />
              <span>sales@akfiresafety.example / amc@akfiresafety.example</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
              <span>Plot 42, Sector 19, Vashi / Turbhe MIDC, Navi Mumbai, MH - 400705</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="pt-2 flex items-center gap-3 text-white/70">
            <a
              href="https://wa.me/919800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white transition-colors font-bold text-[11px]"
            >
              WhatsApp Support
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors font-bold text-[11px]"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-white/10 text-white/80 hover:bg-white/20 transition-colors font-bold text-[11px]"
            >
              X / Twitter
            </a>
          </div>
        </div>

        {/* Product Categories */}
        <div>
          <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3">
            Equipment Catalog
          </p>
          <ul className="space-y-2">
            <li><Link to="/products" className="hover:text-white transition-colors">Complete Catalog</Link></li>
            <li><Link to="/products/fire-extinguishers" className="hover:text-white transition-colors">Fire Extinguishers (ABC/CO2)</Link></li>
            <li><Link to="/products/fire-hydrant-systems" className="hover:text-white transition-colors">Hydrant & Landing Valves</Link></li>
            <li><Link to="/products/smoke-gas-detectors" className="hover:text-white transition-colors">Smoke & Heat Detectors</Link></li>
            <li><Link to="/products/fire-suppression-systems" className="hover:text-white transition-colors">Clean Agent Suppression</Link></li>
            <li><Link to="/products/fire-safety-signages" className="hover:text-white transition-colors">Photoluminescent Signages</Link></li>
            <li><Link to="/request-quote" className="text-amber font-semibold hover:underline">Request B2B Quotation</Link></li>
          </ul>
        </div>

        {/* Services & Maintenance */}
        <div>
          <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3">
            Services & AMC
          </p>
          <ul className="space-y-2">
            <li><Link to="/services/amc" className="hover:text-white transition-colors">Annual Maintenance (AMC)</Link></li>
            <li><Link to="/services/refilling" className="hover:text-white transition-colors">Cylinder Refill & Hydro-Test</Link></li>
            <li><Link to="/services/fire-safety-audit" className="hover:text-white transition-colors">Building Safety Audits</Link></li>
            <li><Link to="/services/installation" className="hover:text-white transition-colors">Turnkey Installation</Link></li>
            <li><Link to="/services/inspection" className="hover:text-white transition-colors">Testing & Diagnostics</Link></li>
            <li><Link to="/book-service" className="hover:text-white text-amber font-semibold transition-colors">Book Service Visit</Link></li>
            <li><Link to="/my-equipment" className="hover:text-white transition-colors">Equipment Tracker</Link></li>
          </ul>
        </div>

        {/* Resources, Legal & Newsletter */}
        <div className="space-y-4">
          <div>
            <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3">
              Knowledge & Legal
            </p>
            <ul className="space-y-1.5">
              <li><Link to="/blog" className="hover:text-white transition-colors">Safety Guides & Articles</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Installation Gallery</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service & Refund</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-white block mb-1">
              Fire Safety Code Updates
            </span>
            {subscribed ? (
              <div className="p-2 rounded bg-green-900/40 border border-green-500/30 text-green-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed to compliance alerts!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-1">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-white/10 border border-white/20 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/50 w-full outline-none focus:border-amber"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-brand hover:bg-brand-dark text-white rounded transition-colors shrink-0"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AK Fire Safety Service. All rights reserved. Registered under Maharashtra Fire Prevention Act.</p>
          <p>GSTIN Registered: 27AABCA1234F1Z8 • Certified ISO 9001:2015 Fire Contractor</p>
        </div>
      </div>
    </footer>
  );
}
