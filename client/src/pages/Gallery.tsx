import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryService } from "@/services/galleryService";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import TrustBadge from "@/components/ui/TrustBadge";
import CTASection from "@/components/ui/CTASection";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MapPin,
  Calendar,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";

interface GalleryCard {
  id: string;
  title: string;
  category: string;
  location: string;
  image: string;
  description: string;
  projectDate?: string;
}

const FALLBACK_ITEMS: GalleryCard[] = [
  {
    id: "g-1",
    title: "Heavy-Duty Wet Riser Hydrant Pipeline Installation",
    category: "Hydrant Systems",
    location: "Logistics Hub, Taloja MIDC",
    image:
      "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=1200&q=80",
    description:
      "Installation of 150mm carbon steel wet riser pipes with IS 5290 oblique landing valves and heavy-duty hose reel stations.",
    projectDate: "March 2024",
  },
  {
    id: "g-2",
    title: "Server Room FM-200 Clean Agent Flooding System",
    category: "Suppression Systems",
    location: "Tier-3 Data Center, Airoli",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    description:
      "Turnkey design and installation of HFC-227ea clean agent cylinders with cross-zoned optical and heat detection triggers.",
    projectDate: "February 2024",
  },
  {
    id: "g-3",
    title: "Hydrostatic Pressure Testing Rig (35 Bar)",
    category: "Refill & Testing",
    location: "Turbhe Central Workshop",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    description:
      "Calibrated hydraulic testing of powder and foam extinguisher cylinders verifying wall expansion and weld seam integrity.",
    projectDate: "January 2024",
  },
  {
    id: "g-4",
    title: "Commercial Kitchen Automatic Hood Suppression",
    category: "Suppression Systems",
    location: "Five-Star Hotel Banquet, Vashi",
    image:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    description:
      "UL-300 compliant wet chemical fire suppression system covering deep fat fryers, cooking ranges, and grease exhaust ducts.",
    projectDate: "December 2023",
  },
  {
    id: "g-5",
    title: "Society Staff Fire Extinguisher Evacuation Drill",
    category: "Safety Training",
    location: "Greenfield CHS, Belapur",
    image:
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80",
    description:
      "Hands-on live fire demonstration training security staff and residents in PASS (Pull, Aim, Squeeze, Sweep) technique.",
    projectDate: "November 2023",
  },
  {
    id: "g-6",
    title: "Automated Main & Jockey Fire Pump Room Setup",
    category: "Hydrant Systems",
    location: "Manufacturing Facility, Mahape",
    image:
      "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Dual diesel and electric high-pressure multistage pumps maintaining 7 kg/cm² pressure across 20 hydrant points.",
    projectDate: "October 2023",
  },
];

export default function Gallery() {
  const [filter, setFilter] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = [
    "All",
    "Hydrant Systems",
    "Suppression Systems",
    "Refill & Testing",
    "Safety Training",
  ];

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ["gallery-items", filter],
    queryFn: () =>
      galleryService.getGalleryItems({
        category: filter === "All" ? undefined : filter,
      }),
  });

  const apiItems = galleryData?.items || [];
  const displayItems: GalleryCard[] =
    apiItems.length > 0
      ? apiItems.map((item: any) => ({
          id: item._id,
          title: item.title,
          category: item.category,
          location: item.location || "Navi Mumbai, MH",
          image: item.imageUrl || item.image,
          description: item.description || "",
          projectDate: item.projectDate,
        }))
      : FALLBACK_ITEMS;

  const filteredItems = displayItems.filter((item) => {
    if (filter === "All") return true;
    return item.category.toLowerCase() === filter.toLowerCase();
  });

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function prevImage() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  }

  function nextImage() {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  }

  const currentLightbox = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <>
      <Seo
        title="Project & Installation Gallery — Shubam Fire Protection"
        description="View real-world fire protection installations, wet riser hydrant networks, server room gas flooding systems, and live fire drills conducted across Maharashtra."
      />

      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 opacity-90" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Project Gallery" }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 hover:[&_a]:text-white"
          />

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800 mb-3">
              <Layers className="w-3.5 h-3.5" /> Proven Engineering Track Record
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white">
              Project Execution & Installation Gallery
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Explore our turnkey engineering installations, automated sprinkler grids, high-pressure hydrant risers, hydrostatic testing facilities, and live society evacuation drills across Navi Mumbai and Mumbai MMR.
            </p>
          </div>
        </div>
      </section>

      <TrustBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Categories Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === cat
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading project installations...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base font-display">No projects found in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Select &apos;All&apos; to view all completed installations.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="group cursor-pointer bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-300 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-3 bg-white/90 rounded-full text-slate-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-600" />
                      <span>{item.location}</span>
                      {item.projectDate && (
                        <>
                          <span>•</span>
                          <span>{item.projectDate}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 font-display group-hover:text-primary-700 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <CTASection
          title="Looking for Turnkey Fire Protection for Your Facility?"
          subtitle="Shubam Fire Protection designs, fabricates, and commissions turnkey wet risers, clean agent flooding, and sprinkler grids with full CFO approval."
          primaryBtnText="Request Project Consultation"
          primaryBtnLink="/request-quote"
          secondaryBtnText="Book Site Inspection"
          secondaryBtnLink="/book-service"
        />
      </main>

      {/* Lightbox Modal */}
      {currentLightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="aspect-16/9 bg-black overflow-hidden flex items-center justify-center">
              <img
                src={currentLightbox.image}
                alt={currentLightbox.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>
            <div className="p-6 text-white space-y-2">
              <div className="flex items-center gap-2 text-xs text-primary-400 font-bold uppercase tracking-wider">
                <span>{currentLightbox.category}</span>
                <span>•</span>
                <span>{currentLightbox.location}</span>
                {currentLightbox.projectDate && (
                  <>
                    <span>•</span>
                    <span>{currentLightbox.projectDate}</span>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold font-display text-white">{currentLightbox.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentLightbox.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
