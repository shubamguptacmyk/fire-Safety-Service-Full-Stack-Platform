import { useState } from "react";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import TrustBadge from "@/components/ui/TrustBadge";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Product Purchase & Pricing");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !message) return;
    setSent(true);
  }

  return (
    <>
      <Seo
        title="Contact Us — Shubam Fire Protection | Navi Mumbai Headquarters"
        description="Get in touch with Shubam Fire Protection. Office & workshop in Vashi, Navi Mumbai. Sales, AMC consultations, emergency refilling, and customer support."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Contact Us" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <PhoneCall className="w-3.5 h-3.5" /> Customer Support & Field Dispatch
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Get in Touch with Our Fire Engineers
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Need certified equipment quotes, on-site fire safety inspection, or urgent extinguisher refilling? Our Navi Mumbai technical team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Details & Office */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                Headquarters & Workshop
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mt-1">
                Navi Mumbai Main Office & Refill Depot
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold text-sm">
                    Main Office & Workshop Facility
                  </strong>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Plot No. 42, Sector 19, Vashi, Navi Mumbai, Maharashtra 400703, India.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Central test bench & cylinder recharge depot located in Turbhe MIDC.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold text-sm">
                    Direct Phone & 24/7 Hotline
                  </strong>
                  <p className="text-slate-600 mt-1">
                    Customer Hotline: +91 98000 00000 · Landline: +91 22 2789 0000
                  </p>
                  <a
                    href="https://wa.me/919800000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <MessageSquare className="w-4 h-4" /> Quick Inquiry on WhatsApp →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold text-sm">
                    Email Correspondence
                  </strong>
                  <p className="text-slate-600 mt-1">
                    Sales & RFQs: sales@shubamfire.in
                    <br />
                    AMC & Form B Compliance: amc@shubamfire.in
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold text-sm">
                    Working Hours
                  </strong>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Monday to Saturday: 9:00 AM – 8:00 PM
                    <br />
                    Emergency Dispatch: 24/7 on-call for active AMC contract holders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-10 shadow-xl">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-display text-slate-900">
                  Inquiry Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you <strong>{name}</strong>. A technical sales engineer will review your request and get back to you at <strong>{phone}</strong> shortly.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setSent(false)}
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                    Connect With Us
                  </span>
                  <h3 className="font-display font-bold text-2xl text-slate-900 mt-0.5">
                    Send Us an Inquiry
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill in your details below and an engineer will respond within 2 business hours.
                  </p>
                </div>

                <Input
                  label="Your Full Name *"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Deshmukh"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number *"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>

                <Select
                  label="Inquiry Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  options={[
                    { value: "Product Purchase & Pricing", label: "Product Purchase & Pricing" },
                    { value: "AMC Contract Consultation", label: "AMC Contract Consultation" },
                    { value: "Fire Extinguisher Refilling Pickup", label: "Fire Extinguisher Refilling Pickup" },
                    { value: "Fire Safety Audit & Form B", label: "Fire Safety Audit & Form B" },
                    { value: "Installation & Turnkey Project", label: "Installation & Turnkey Project" },
                    { value: "Other / General Support", label: "Other / General Support" },
                  ]}
                />

                <Textarea
                  label="Message / Requirements *"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please specify your equipment count, site location, or required service..."
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
