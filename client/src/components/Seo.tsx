import { useEffect } from "react";

// Lightweight SEO helper for a Vite SPA (no Next.js metadata API available).
// Sets document title + meta description on mount, per spec section 57.
interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
}

export default function Seo({ title, description, canonical }: SeoProps) {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, canonical]);

  return null;
}
