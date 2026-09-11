import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/blogService";
import Seo from "@/components/Seo";
import { FALLBACK_ARTICLES } from "./Blog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  Building2,
  ShieldCheck,
  User,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const fallback =
    FALLBACK_ARTICLES.find((a) => a.slug === slug) || FALLBACK_ARTICLES[0];

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogService.getPostBySlug(slug!),
    enabled: Boolean(slug),
  });

  const title = post?.title || fallback.title;
  const summary = post?.excerpt || fallback.summary;
  const content = post?.content;
  const category = post?.category || fallback.category;
  const image = post?.featuredImage || fallback.image;
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : fallback.date;
  const readTime = post?.readTime ? `${post.readTime} min read` : fallback.readTime;
  const authorName = post?.author?.name || fallback.author || "AK Fire Safety Technical Cell";
  const authorRole = post?.author?.role || "Licensed Safety Consultant & Auditor";

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleCopyLink() {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const relatedArticles = FALLBACK_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Seo
        title={`${title} — AK Fire Safety Blog`}
        description={summary}
      />

      <div className="bg-paper border-b border-black/10 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-steel hover:text-brand font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Fire Safety Knowledge Base
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Article Header */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand px-2.5 py-0.5 bg-brand/10 rounded">
              {category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink mt-3 leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-steel mt-4 pb-6 border-b border-black/10">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readTime}
              </span>
              <span>•</span>
              <span className="text-ink font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand" /> {authorName}
              </span>
            </div>

            {/* Social Sharing CTAs */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-steel">Share:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${title} - Read more at: ${currentUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  currentUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-[#0A66C2] hover:bg-[#084e96] text-white text-[10px] font-bold"
                title="Share on LinkedIn"
              >
                in
              </a>
              <button
                onClick={handleCopyLink}
                className="px-2 py-1 rounded border border-black/15 hover:bg-paper text-ink text-[10px] font-semibold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : null}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Featured Header Image */}
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-paper border border-black/10 shadow-sm">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Article Body Content */}
        <div className="prose max-w-none text-ink text-sm sm:text-base leading-relaxed space-y-6">
          <p className="font-semibold text-lg text-ink/90 leading-snug border-l-4 border-brand pl-4 py-1 italic bg-paper/50 rounded-r">
            {summary}
          </p>

          {content ? (
            <div
              className="space-y-4 whitespace-pre-line text-steel leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <>
              <h3 className="text-xl font-bold font-display text-ink pt-4">
                1. Understanding the Classification of Hazards
              </h3>
              <p className="text-steel">
                Fire safety regulations in India are codified under the{" "}
                <strong>National Building Code (NBC Part IV)</strong> and relevant Bureau of
                Indian Standards (BIS) specifications. Selecting an extinguisher without
                understanding the underlying fire class risks creating false security or causing
                electrical shock hazards.
              </p>

              <div className="bg-paper p-5 rounded-xl border border-black/10 space-y-2 text-xs sm:text-sm">
                <h4 className="font-bold text-ink">Core Hazard Quick Reference:</h4>
                <p>
                  <strong>• Class A (Carbonaceous Solids):</strong> Wood, cloth, paper, plastic — ABC
                  powder or Water/Foam recommended.
                </p>
                <p>
                  <strong>• Class B (Flammable Liquids):</strong> Petrol, diesel, thinner, solvents —
                  AFFF Foam or CO2 mandatory.
                </p>
                <p>
                  <strong>• Class C (Flammable Gases):</strong> LPG, methane, acetylene — ABC Powder
                  with shutoff valve.
                </p>
                <p>
                  <strong>• Electrical Fires:</strong> Transformers, switchboards, server racks —
                  CO2 or Clean Agent (FE-36 / HFC-236fa).
                </p>
              </div>

              <h3 className="text-xl font-bold font-display text-ink pt-4">
                2. Inspection & Maintenance Best Practices
              </h3>
              <p className="text-steel">
                Every extinguisher must display a visible tamper seal, intact safety pin, and clear
                inspection tag indicating the last hydro test date. If a pressure gauge dial dips into
                the red recharge band, the cylinder must be immediately dispatched for chemical
                refilling and hydrostatic pressure verification.
              </p>

              <h3 className="text-xl font-bold font-display text-ink pt-4">
                3. Statutory Compliance and Form B Sign-Off
              </h3>
              <p className="text-steel">
                Under the Maharashtra Fire Prevention and Life Safety Measures Act, failure to
                maintain fire equipment invites penalty notices and disconnection of civic services.
                Engaging a licensed Category &lsquo;A&rsquo; fire protection agency guarantees that
                annual servicing meets the rigorous requirements expected by municipal fire
                inspectors.
              </p>
            </>
          )}
        </div>

        {/* Author Bio Card */}
        <div className="bg-paper border border-black/10 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg shrink-0">
            {authorName.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-steel font-bold">Article Author</span>
            <h4 className="font-bold text-sm text-ink">{authorName}</h4>
            <p className="text-xs text-steel">{authorRole} • AK Fire Safety Engineering Cell</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-ink text-white rounded-2xl p-8 flex flex-wrap items-center justify-between gap-6 shadow-md">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber font-bold">
              Engineering Consultation
            </span>
            <h3 className="text-xl font-bold font-display mt-1">Need a Fire Safety Audit for Your Premises?</h3>
            <p className="text-xs text-white/70 mt-1 max-w-md">
              Our licensed engineers provide on-site safety surveys, risk reports, and Form B compliance across Navi Mumbai.
            </p>
          </div>
          <Link
            to="/services/fire-safety-audit"
            className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold shadow-sm transition-colors"
          >
            Request Site Inspection
          </Link>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-black/10 space-y-6">
            <h3 className="font-display font-bold text-xl text-ink">Related Fire Safety Guides</h3>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand/40 transition-all flex flex-col justify-between group"
                >
                  <div className="aspect-[16/10] bg-paper overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-brand uppercase">{rel.category}</span>
                      <h4 className="font-display font-bold text-xs text-ink group-hover:text-brand transition-colors line-clamp-2 mt-1">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-brand font-semibold inline-flex items-center gap-1 mt-3">
                      Read Guide <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
