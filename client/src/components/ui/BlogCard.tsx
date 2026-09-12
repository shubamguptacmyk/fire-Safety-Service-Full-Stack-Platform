import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";
import Card from "./Card";
import Badge from "../Badge";

export interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  authorName?: string;
  date?: string;
  readingTime?: string;
  className?: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  coverImage,
  category = "Safety Compliance",
  authorName = "Technical Cell",
  date,
  readingTime = "4 min read",
  className = "",
}: BlogCardProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Card hoverable className={`flex flex-col h-full group ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link to={`/blog/${slug}`}>
          <img
            src={
              coverImage ||
              "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80"
            }
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        {category && (
          <div className="absolute top-3 left-3">
            <Badge tone="primary">{category}</Badge>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              {authorName}
            </span>
            <span>&bull;</span>
            <span>{readingTime}</span>
          </div>

          <Link to={`/blog/${slug}`}>
            <h3 className="text-base font-bold font-display text-dark group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {excerpt && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {excerpt}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link
            to={`/blog/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800 transition-colors"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default BlogCard;
