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
  Clock,
  Award,
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
    <footer className="bg-dark text-slate-300 mt-20 border-t border-slate-800">
      {/* Top Statutory Credentials Bar */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-2 text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="break-words">Govt. Approved Licensed Agency &bull; Directorate of Maharashtra Fire Services</span>
          </div>
          <div className="flex items-start sm:items-center gap-2 text-slate-300">
            <FileCheck className="w-4 h-4 text-primary-500 shrink-0 mt-0.5 sm:mt-0" />
            <span className="break-words">Form B Compliance Certification &bull; IS 15683 / IS 2190 / NBC 2016 Part IV</span>
          </div>
          <div className="flex items-center gap-2 text-orange-400">
            <Award className="w-4 h-4 shrink-0" />
            <span>ISO 9001:2015 Certified Contractor</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 text-xs leading-relaxed">
        {/* Brand & Corporate Contact */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center shadow-sm shrink-0">
              <Flame className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight block leading-tight break-words">
                SHUBAM FIRE PROTECTION
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mt-0.5 break-words">
                Professional Fire Protection &amp; Safety Solutions
              </span>
            </div>
          </div>

          <p className="text-slate-400 max-w-sm leading-relaxed">
            Turnkey fire protection engineering, ISI-certified fire safety equipment distribution,
            calibrated hydrostatic cylinder refilling, and statutory biannual Form B inspection
            services across Navi Mumbai, Mumbai, Thane, Taloja MIDC, and Maharashtra.
          </p>

          <div className="space-y-2.5 pt-2 text-slate-300">
            <p className="flex items-start sm:items-center gap-2.5">
              <Phone className="w-4 h-4 text-primary-500 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="break-words">24/7 Hotline: +91 98000 00000 / +91 98200 12345</span>
            </p>
            <p className="flex items-start sm:items-center gap-2.5">
              <Mail className="w-4 h-4 text-primary-500 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
              <span className="break-all sm:break-normal">sales@shubamfire.com / amc@shubamfire.com</span>
            </p>
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="break-words">Plot 42, Sector 19, Vashi / Turbhe MIDC, Navi Mumbai, MH - 400705</span>
            </p>
            <p className="flex items-start sm:items-center gap-2.5 text-slate-400">
              <Clock className="w-4 h-4 text-accent shrink-0 mt-0.5 sm:mt-0" />
              <span className="break-words">Hours: Mon - Sat: 9:00 AM – 7:30 PM (24/7 Emergency Support)</span>
            </p>
          </div>

          {/* Social / Direct Action Links */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <a
              href="https://wa.me/919800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors font-bold text-xs"
            >
              WhatsApp Support
            </a>
            <Link
              to="/request-quote"
              className="px-3 py-1.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors font-bold text-xs"
            >
              Request B2B Quote
            </Link>
          </div>
        </div>

        {/* Product Catalog */}
        <div>
          <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3.5">
            Equipment Catalog
          </p>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/products" className="hover:text-white transition-colors">All Products &amp; Gear</Link></li>
            <li><Link to="/products/fire-extinguishers" className="hover:text-white transition-colors">Fire Extinguishers (ABC/CO2)</Link></li>
            <li><Link to="/products/fire-hydrant-systems" className="hover:text-white transition-colors">Hydrant &amp; Landing Valves</Link></li>
            <li><Link to="/products/smoke-gas-detectors" className="hover:text-white transition-colors">Smoke &amp; Heat Detectors</Link></li>
            <li><Link to="/products/fire-suppression-systems" className="hover:text-white transition-colors">Clean Agent Gas Suppression</Link></li>
            <li><Link to="/products/fire-safety-signages" className="hover:text-white transition-colors">Photoluminescent Signages</Link></li>
            <li><Link to="/request-quote" className="text-orange-400 font-semibold hover:underline">Bulk Equipment Quotes</Link></li>
          </ul>
        </div>

        {/* Services & Maintenance */}
        <div>
          <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3.5">
            Services &amp; AMC
          </p>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/services" className="hover:text-white transition-colors">All Engineering Services</Link></li>
            <li><Link to="/services/amc" className="hover:text-white transition-colors">Annual Maintenance (AMC)</Link></li>
            <li><Link to="/services/refilling" className="hover:text-white transition-colors">Cylinder Refill &amp; Hydro-Test</Link></li>
            <li><Link to="/services/fire-safety-audit" className="hover:text-white transition-colors">Building Safety Audits</Link></li>
            <li><Link to="/services/installation" className="hover:text-white transition-colors">Turnkey System Installation</Link></li>
            <li><Link to="/services/inspection" className="hover:text-white transition-colors">Testing &amp; Diagnostics</Link></li>
            <li><Link to="/book-service" className="text-orange-400 font-semibold hover:underline">Book Technician Visit</Link></li>
            <li><Link to="/my-equipment" className="hover:text-white transition-colors">Equipment Tracker</Link></li>
          </ul>
        </div>

        {/* Resources, Legal & Newsletter */}
        <div className="space-y-5">
          <div>
            <p className="text-white font-bold font-display uppercase tracking-wider text-xs mb-3.5">
              Knowledge &amp; Company
            </p>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/blog" className="hover:text-white transition-colors">Safety Guides &amp; Articles</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/gallery" className="hover:text-white transition-colors">Project Installation Gallery</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Shubam Fire Protection</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-white block mb-1.5">
              Fire Safety Code Updates &amp; Alerts
            </span>
            {subscribed ? (
              <div className="p-2.5 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Subscribed to compliance updates!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-1.5">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 w-full outline-none focus:border-primary-600 transition-colors"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary-700 hover:bg-primary-800 text-white rounded-lg transition-colors shrink-0 shadow-sm"
                  title="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="break-words">
            &copy; {new Date().getFullYear()} Shubam Fire Protection. All rights reserved.
            Licensed under Maharashtra Fire Prevention and Life Safety Measures Act.
          </p>
          <p className="break-words">GSTIN Registered: 27AABCS1234F1Z8 &bull; Directorate of Maharashtra Fire Services Approved</p>
        </div>
      </div>
    </footer>
  );
}
