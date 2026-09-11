import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <Seo title="Page Not Found — AK Fire Safety Service" description="The page you're looking for doesn't exist." />
      <p className="font-display text-6xl font-bold text-brand">404</p>
      <p className="mt-2 text-steel">This page doesn't exist or may have moved.</p>
      <Link to="/" className="inline-block mt-6 bg-brand text-white px-5 py-2.5 rounded text-sm font-medium">Back to Home</Link>
    </div>
  );
}
