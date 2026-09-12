import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/services/blogService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import TrustBadge from "@/components/ui/TrustBadge";
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
  const authorName = post?.author?.name || fallback.author || "Shubam Fire Protection Technical Cell";
  const authorRole = post?.author?.role || "Licensed Fire Safety Consultant & Auditor";

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
        title={`${title} — Shubam Fire Protection Knowledge Base`}
        description={summary}
      />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: "Knowledge Base", href: "/blog" },
              { label: category, href: `/blog` },
              { label: "Article" },
            ]}
            className="mb-4 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
            {category}
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white leading-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-400" /> {date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-400" /> {readTime}
              </span>
              <span>•</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary-400" /> {authorName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">Share:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${title} - Read more at: ${currentUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Featured Header Image */}
        <div className="aspect-16/9 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>

        {/* Article Summary Lead */}
        <div className="p-6 bg-primary-50/60 rounded-2xl border-l-4 border-primary-600 text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
          {summary}
        </div>

        {/* Article Body Content */}
        <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          {content ? (
            <div
              className="space-y-4 whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 pt-4">
                1. Understanding the Classification of Hazards
              </h2>
              <p>
                Fire safety regulations in India are codified under the{" "}
                <strong>National Building Code (NBC 2016 Part IV)</strong> and relevant Bureau of
                Indian Standards (BIS) specifications. Selecting an extinguisher without
                understanding the underlying fire class risks creating false security or causing
                electrical shock hazards during emergency activation.
              </p>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs sm:text-sm">
                <h3 className="font-bold text-slate-900 text-base">Core Hazard Quick Reference:</h3>
                <p>
                  <strong>• Class A (Carbonaceous Solids):</strong> Wood, cloth, paper, textiles — ABC
                  powder or Water/Foam recommended.
                </p>
                <p>
                  <strong>• Class B (Flammable Liquids):</strong> Petrol, diesel, thinner, paints, cooking oils —
                  AFFF Foam or CO2 mandatory.
                </p>
                <p>
                  <strong>• Class C (Flammable Gases):</strong> LPG, methane, acetylene — ABC Powder
                  with shutoff valve.
                </p>
                <p>
                  <strong>• Electrical Fires:</strong> Transformers, switchboards, UPS battery racks, server rooms —
                  CO2 or Clean Agent (FE-36 / HFC-236fa) to avoid corrosive residue.
                </p>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 pt-4">
                2. Inspection & Maintenance Best Practices
              </h2>
              <p>
                Every extinguisher must display an intact tamper seal, safety pin, and legible
                inspection tag indicating the last hydrostatic test date. If a pressure gauge dial dips into
                the red recharge band, the cylinder must be immediately sent for chemical
                refilling and hydrostatic pressure verification per IS 2190 norms.
              </p>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 pt-4">
                3. Statutory Compliance and Form B Sign-Off
              </h2>
              <p>
                Under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, failure to
                maintain fire equipment invites severe municipal penalty notices, electricity disconnection,
                and revocation of insurance claims. Engaging a licensed fire protection agency guarantees that
                annual servicing meets the statutory requirements expected by municipal fire
                inspectors.
              </p>
            </>
          )}
        </div>

        {/* Author Bio Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            {authorName.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Article Author
            </span>
            <h4 className="font-bold text-base text-slate-900 font-display">{authorName}</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {authorRole} • Shubam Fire Protection Technical Cell
            </p>
          </div>
        </div>

        {/* Consultation Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs uppercase tracking-wider text-primary-400 font-bold font-mono">
              Engineering Consultation
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              Need a Building Fire Safety Audit?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Our licensed engineers provide on-site safety surveys, risk gap reports, and Form B compliance filings across Navi Mumbai.
            </p>
          </div>
          <Button asChild variant="primary" size="lg" className="shrink-0">
            <Link to="/book-service?type=Fire%20Safety%20Audit">
              Request Site Audit <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
        </div>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <div className="pt-8 border-t border-slate-200 space-y-6">
            <h3 className="font-display font-bold text-2xl text-slate-900">
              Related Fire Safety Guides
            </h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex flex-col justify-between group"
                >
                  <div className="aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
                        {rel.category}
                      </span>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-2 mt-1">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-xs text-primary-600 font-bold inline-flex items-center gap-1 mt-3">
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
