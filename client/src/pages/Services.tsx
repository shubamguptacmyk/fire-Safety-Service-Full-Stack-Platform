import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import CTASection from "@/components/ui/CTASection";
import TrustBadge from "@/components/ui/TrustBadge";
import { bannerService, BannerItem } from "@/services/bannerService";
import {
  Wrench,
  ShieldCheck,
  ClipboardCheck,
  Flame,
  ArrowRight,
  Truck,
  Building2,
  PhoneCall,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";

export default function Services() {
  const [topBanners, setTopBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    bannerService
      .getActiveBanners("services_top")
      .then((banners) => setTopBanners(banners || []))
      .catch(() => setTopBanners([]));
  }, []);

  const services = [
    {
      href: "/services/amc",
      title: "Annual Maintenance Contracts (AMC)",
      badge: "Statutory Mandate",
      tone: "primary" as const,
      icon: Calendar,
      desc: "Scheduled quarterly and bi-annual inspections, preventative pressure checks, and Form B certificate issuance for residential societies and commercial premises.",
      features: [
        "Scheduled quarterly certified technician visits",
        "Form B compliance filing assistance & liaison",
        "24/7 priority emergency repair callouts included",
        "Digital maintenance logs & compliance recordkeeping",
      ],
    },
    {
      href: "/services/refilling",
      title: "Certified Cylinder Refilling & Hydro-Testing",
      badge: "BIS Calibrated",
      tone: "secondary" as const,
      icon: Wrench,
      desc: "Authentic MAP 50% ABC powder, pure CO2 gas, clean agent, and mechanical foam refills with 35-bar calibrated hydrostatic proof testing.",
      features: [
        "Genuine BIS chemical formulations (IS 4308 / IS 2878)",
        "Calibrated hydrostatic testing up to 250 bar",
        "Free doorstep pickup & drop with standby loaner units",
        "Holographic barcode tagging & test certification",
      ],
    },
    {
      href: "/services/fire-safety-audit",
      title: "Building Fire Safety Audits",
      badge: "NBC Part IV",
      tone: "warning" as const,
      icon: ClipboardCheck,
      desc: "Comprehensive on-site risk assessment by certified Fire Safety Officers evaluating escape corridors, pump houses, wet risers, and statutory gaps.",
      features: [
        "Full risk-gap analysis conforming to NBC Part IV",
        "Evacuation routing & emergency signage reviews",
        "Statutory municipal notice compliance assistance",
        "Actionable mitigation roadmaps & cost estimations",
      ],
    },
    {
      href: "/services/installation",
      title: "Hydrant & Suppression System Installation",
      badge: "Turnkey EPC",
      tone: "accent" as const,
      icon: Flame,
      desc: "Complete hydraulic design, piping fabrication, and commissioning of wet riser hydrants, automatic sprinkler grids, and FM-200 / Novec clean agent flooding systems.",
      features: [
        "Certified MS ERW Class C pipeline welding & erection",
        "UL-listed clean agent flooding for server rooms",
        "Multi-stage electric & diesel fire pump integration",
        "Municipal CFO fire approvals & NOC certification",
      ],
    },
    {
      href: "/services/inspection",
      title: "Periodic Safety Inspection & Pressure Audits",
      badge: "Pre-Audit Check",
      tone: "neutral" as const,
      icon: ShieldCheck,
      desc: "On-demand preventive maintenance audits of all fire extinguishers, hose reel stations, and smoke alarms across your facility with instant digital reports.",
      features: [
        "Precision gauge pressure needle & seal verification",
        "Discharge horn & hose integrity diagnostics",
        "Dynamic pitot tube flow tests at remote landing valves",
        "Instant digital job card & asset register updates",
      ],
    },
    {
      href: "/book-service?type=Repair",
      title: "Emergency Repairs & Spares Replacement",
      badge: "Rapid Response",
      tone: "primary" as const,
      icon: Truck,
      desc: "Immediate replacement of burst discharge hoses, leaking landing valves, uncalibrated pressure gauges, broken hydrant handwheels, and alarm sirens.",
      features: [
        "Same-day emergency response in Mumbai MMR",
        "Genuine brass replacement fittings & O-rings",
        "100% pneumatic & hydrostatic pressure testing",
        "Guaranteed compatibility with all major brands",
      ],
    },
  ];

  return (
    <>
      <Seo
        title="Fire Protection & Safety Services — Shubam Fire Protection"
        description="Comprehensive fire safety services: AMC maintenance, extinguisher refilling, building safety audits, hydrant installations, and Form B compliance across Navi Mumbai & Mumbai MMR."
      />

      {/* Dynamic services_top Banner if configured in backend */}
      {topBanners.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {topBanners.map((banner) => (
              <div
                key={banner._id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-primary-950 via-slate-900 to-slate-800 border border-primary-900/40"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-primary-600/20 text-primary-400 rounded-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-xs text-slate-300 mt-0.5">{banner.subtitle}</p>
                    )}
                  </div>
                </div>
                {banner.link && (
                  <Link
                    to={banner.link}
                    className="shrink-0 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {banner.buttonText || "Learn More"}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Services" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Turnkey Fire Engineering & Maintenance
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Certified Fire Protection Services
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              From single extinguisher refilling to multi-storey hydrant pipeline installations and statutory
              Maharashtra Fire Prevention Act (Form B) audits, Shubam Fire Protection ensures 100% regulatory
              compliance with zero compromise on life safety.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="primary">
                <Link to="/book-service">
                  Book Technician Visit <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="white">
                <Link to="/request-quote">Request Commercial Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Credentials Bar */}
      <TrustBadge />

      {/* Services Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Our Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
              End-to-End Life Safety & Compliance Solutions
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every service is delivered by factory-certified technicians adhering strictly to Bureau of Indian Standards (BIS) and National Building Code (NBC Part IV) specifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge tone={s.tone}>{s.badge}</Badge>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-primary-700 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                      {s.desc}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Key Deliverables:
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {s.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Link
                      to={s.href}
                      className="w-full py-2.5 bg-slate-50 hover:bg-primary-600 hover:text-white text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-200/80 group-hover:border-primary-600 shadow-sm"
                    >
                      Explore Service Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form B & Statutory Compliance Info Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800">
                <Award className="w-3.5 h-3.5" /> Statutory Maharashtra Mandate
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Biannual Form B Certification for Societies & Commercial Towers
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Under Section 3(1) of the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, all building owners and housing societies must submit <strong>Form B</strong> every January and July to the local Chief Fire Officer (CFO). Non-compliance can result in electricity disconnection, municipal penalties, or loss of insurance coverage.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authorized Licensed Agency
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% CFO Acceptance Rate
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Digital Inspection Logs
                </span>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 text-center shadow-lg space-y-3">
              <span className="text-xs uppercase font-bold tracking-wider text-primary-400 block">
                Next Submission Window
              </span>
              <h3 className="text-xl font-bold text-white font-display">January & July Filings</h3>
              <p className="text-xs text-slate-400">
                Book your pre-audit inspection today to guarantee zero compliance delays.
              </p>
              <Button asChild className="w-full mt-2" variant="primary">
                <Link to="/book-service?type=Fire%20Safety%20Audit">
                  Schedule Form B Audit
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency Helpline Banner */}
        <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-primary-700/50">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center justify-center md:justify-start gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> 24/7 Rapid Response Helpline
            </span>
            <h2 className="text-2xl font-display font-bold text-white">
              Need Urgent Refilling or Emergency Repair?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              Our mobile service vans cover Vashi, Belapur, Mahape, Taloja, Airoli, Rabale, and Panvel with ready-to-deploy cylinder stock and certified technicians.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Button asChild variant="white" size="lg">
              <Link to="/book-service">Book Technician Online</Link>
            </Button>
            <a
              href="tel:+919800000000"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
            >
              <PhoneCall className="w-4 h-4" /> Call: +91 98000 00000
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
