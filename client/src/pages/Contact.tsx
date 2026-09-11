import { useState } from "react";
import Seo from "@/components/Seo";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
} from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
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
        title="Contact AK Fire Safety Service — Navi Mumbai Headquarters"
        description="Get in touch with AK Fire Safety Service. Office in Vashi, Navi Mumbai. Sales, AMC consultations, emergency refilling, and customer support."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">Customer Support & Dispatch</span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Get in Touch with Our Fire Engineers
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed">
            Need equipment quotes, on-site inspection, or urgent extinguisher refilling? Our Navi Mumbai
            team is ready to assist you.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Details & Office */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Headquarters</span>
              <h2 className="text-2xl font-display font-bold text-ink mt-1">Navi Mumbai Main Office & Workshop</h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-black/10 shadow-sm">
                <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block font-semibold text-sm">Main Office & Refill Depot</strong>
                  <p className="text-steel mt-0.5 leading-relaxed">
                    Plot No. 42, Sector 19, Vashi, Navi Mumbai, Maharashtra 400703, India.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-black/10 shadow-sm">
                <Phone className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block font-semibold text-sm">Direct Phone & WhatsApp</strong>
                  <p className="text-steel mt-0.5">
                    Landline: +91 22 2789 0000 / Mobile: +91 98000 00000
                  </p>
                  <a
                    href="https://wa.me/919800000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat directly on WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-black/10 shadow-sm">
                <Mail className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block font-semibold text-sm">Email Correspondence</strong>
                  <p className="text-steel mt-0.5">
                    Sales & Quoting: sales@akfiresafety.example
                    <br />
                    Compliance & AMC: amc@akfiresafety.example
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-black/10 shadow-sm">
                <Clock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink block font-semibold text-sm">Working Hours</strong>
                  <p className="text-steel mt-0.5">
                    Monday to Saturday: 9:00 AM – 8:00 PM
                    <br />
                    Emergency Dispatch: 24/7 on-call for AMC contract holders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Inquiry Form */}
          <div className="bg-white border border-black/10 rounded-xl p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="text-xl font-bold font-display text-ink">Inquiry Received!</h3>
                <p className="text-xs text-steel max-w-sm mx-auto leading-relaxed">
                  Thank you <strong>{name}</strong>. A technical sales engineer will get back to you at{" "}
                  <strong>{phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 px-4 py-2 bg-paper hover:bg-gray-200 border border-black/10 text-xs font-semibold rounded text-ink"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-display font-bold text-lg text-ink">Send Us an Inquiry</h3>

                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Deshmukh"
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Inquiry Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none bg-white"
                  >
                    <option value="Product Purchase & Pricing">Product Purchase & Pricing</option>
                    <option value="AMC Contract Consultation">AMC Contract Consultation</option>
                    <option value="Fire Extinguisher Refilling Pickup">Fire Extinguisher Refilling Pickup</option>
                    <option value="Fire Safety Audit & Form B">Fire Safety Audit & Form B</option>
                    <option value="Other / General Support">Other / General Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/80 mb-1">Message / Requirements *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify your equipment count, location, or required service..."
                    className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
