import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { galleryService } from "@/services/galleryService";
import Seo from "@/components/Seo";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MapPin,
  Calendar,
  Layers,
  Loader2,
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

  const { data, isLoading } = useQuery({
    queryKey: ["public-gallery", filter],
    queryFn: () =>
      galleryService.getGalleryItems({
        category: filter === "All" ? undefined : filter,
      }),
  });

  const apiItems = data?.items || [];

  const items: GalleryCard[] =
    apiItems.length > 0
      ? apiItems.map((item) => ({
          id: item._id,
          title: item.title,
          category: item.category,
          location: item.location || "Navi Mumbai, Maharashtra",
          image: item.imageUrl,
          description: item.description || "",
          projectDate: item.projectDate,
        }))
      : FALLBACK_ITEMS.filter(
          (item) => filter === "All" || item.category === filter
        );

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : null
        );
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, items.length]);

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <>
      <Seo
        title="Project & Installation Gallery — AK Fire Safety Service"
        description="View our recent fire safety installations: wet riser hydrants, FM-200 gas suppression, workshop hydro-testing, and corporate evacuation drills in Navi Mumbai."
      />

      <div className="bg-ink text-white py-12 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <span className="text-xs uppercase tracking-wider text-amber font-semibold">
            Field Installations & Turnkey Systems
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold mt-1">
            Project & Engineering Gallery
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed">
            Photographs from real on-site installations, workshop hydrostatic testing, and corporate
            evacuation drills across Maharashtra.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === cat
                  ? "bg-brand text-white shadow-sm"
                  : "bg-paper text-ink hover:bg-gray-200 border border-black/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto" />
            <p className="text-xs text-steel">Loading project gallery...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group bg-white border border-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-paper overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2.5 rounded-full bg-white/90 text-ink shadow-md flex items-center gap-1.5 text-xs font-semibold">
                      <Maximize2 className="w-4 h-4" /> Expand Photo
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-ink/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-brand font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {item.location}
                    </span>
                    <h3 className="font-bold text-sm text-ink font-display mt-1.5 leading-snug group-hover:text-brand transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-steel mt-2 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activeItem && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-ink text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null ? (prev > 0 ? prev - 1 : items.length - 1) : null
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) =>
                  prev !== null ? (prev < items.length - 1 ? prev + 1 : 0) : null
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Viewer */}
            <div className="aspect-[16/10] bg-black flex items-center justify-center">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info Footer */}
            <div className="p-6 bg-ink border-t border-white/10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <span className="text-xs text-white/60">
                  {lightboxIndex + 1} of {items.length}
                </span>
              </div>

              <h2 className="text-lg font-bold font-display text-white">{activeItem.title}</h2>

              <p className="text-xs text-white/70 leading-relaxed">{activeItem.description}</p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-white/50 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> {activeItem.location}
                </span>
                {activeItem.projectDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Completed: {activeItem.projectDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
