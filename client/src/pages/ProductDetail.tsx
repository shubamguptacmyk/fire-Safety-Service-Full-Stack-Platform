import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuthStore } from "@/store/authStore";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import {
  ShieldCheck,
  ShoppingCart,
  FileText,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ArrowLeft,
  FileSpreadsheet,
  Heart,
  Star,
  Loader2,
  MessageSquare,
  Sparkles,
  Phone,
} from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setQuoteMode } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "description" | "reviews">("specs");
  const [addedNotification, setAddedNotification] = useState(false);

  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product-detail", slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: Boolean(slug),
  });

  const product = data?.product;

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["product-reviews", product?._id],
    queryFn: () => reviewService.getProductReviews(product!._id),
    enabled: Boolean(product?._id),
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-3 border-primary-700 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading equipment specifications...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-dark mb-2">Equipment Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">
          The requested fire safety gear could not be located in our catalog.
        </p>
        <Link to="/products">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const { relatedProducts } = data;
  const currentPrice = product.discountPrice || product.price;
  const discountPercent =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : null;

  const images = product.images?.length
    ? product.images
    : [
        {
          url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
          isPrimary: true,
        },
      ];

  const activeImage = images[selectedImageIndex]?.url || images[0].url;
  const isFavorited = product ? isInWishlist(product._id) : false;

  const categoryName =
    typeof product.category === "object" && product.category !== null
      ? (product.category as any).name
      : null;
  const categorySlug =
    typeof product.category === "object" && product.category !== null
      ? (product.category as any).slug
      : null;

  function handleAddToCart() {
    if (!product || product.stock <= 0) return;
    addItem(product._id, quantity);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 2500);
  }

  function handleRequestQuote() {
    if (!product) return;
    addItem(product._id, quantity);
    setQuoteMode(true);
    navigate("/cart");
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`);
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    setReviewErrorMsg(null);
    setReviewSuccessMsg(null);

    try {
      await reviewService.createReview({
        productId: product._id,
        rating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });
      setReviewSuccessMsg(
        "Thank you! Your technical review has been submitted and is pending safety moderation. It will be published shortly."
      );
      setReviewTitle("");
      setReviewComment("");
      setShowReviewForm(false);
      refetchReviews();
    } catch (err: any) {
      setReviewErrorMsg(err.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <>
      <Seo
        title={`${product.name} — Shubam Fire Protection`}
        description={product.shortDescription || product.description}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              ...(categoryName && categorySlug
                ? [{ label: categoryName, href: `/products/${categorySlug}` }]
                : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex items-center justify-center p-8 shadow-card relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => toggleItem(product._id)}
                className={`absolute top-4 right-4 p-3 rounded-full border shadow-2xs transition-all ${
                  isFavorited
                    ? "bg-red-50 border-red-200 text-primary-700 hover:bg-red-100"
                    : "bg-white/90 backdrop-blur-xs border-slate-200 text-slate-500 hover:text-primary-700 hover:bg-white"
                }`}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-primary-700 text-primary-700" : ""}`} />
              </button>

              {discountPercent && (
                <span className="absolute top-4 left-4 bg-primary-700 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl border p-1.5 shrink-0 bg-white transition-all ${
                      selectedImageIndex === idx
                        ? "border-primary-700 ring-2 ring-primary-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Credentials Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 text-center">
              <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-primary-700 mx-auto mb-1.5 shrink-0" />
                <p className="text-xs font-bold text-dark truncate">ISI Certified</p>
                <p className="text-[10px] text-slate-500 truncate">IS 15683 &bull; IS 2190</p>
              </div>
              <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5 shrink-0" />
                <p className="text-xs font-bold text-dark truncate">Direct Dispatch</p>
                <p className="text-[10px] text-slate-500 truncate">Maharashtra Wide</p>
              </div>
              <div className="p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-orange-600 mx-auto mb-1.5 shrink-0" />
                <p className="text-xs font-bold text-dark truncate">AMC Eligible</p>
                <p className="text-[10px] text-slate-500 truncate">Form B Inspection</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-primary-700 uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="font-mono text-slate-400">SKU: {product.SKU}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-dark leading-tight">
                {product.name}
              </h1>

              {/* Reviews Summary */}
              {reviewsData && reviewsData.total > 0 ? (
                <div
                  className="flex items-center gap-2 mt-2.5 cursor-pointer group"
                  onClick={() => setActiveTab("reviews")}
                >
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(reviewsData.averageRating)
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-dark">
                    {reviewsData.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 group-hover:text-primary-700 transition-colors">
                    ({reviewsData.total} verified review{reviewsData.total > 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab("reviews");
                    setShowReviewForm(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-primary-700 hover:underline mt-2 font-medium"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Be the first to review this product</span>
                </button>
              )}

              {product.shortDescription && (
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Fire Classes & Capacity Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {product.fireClass?.map((fc) => (
                  <span
                    key={fc}
                    className="px-3 py-1 bg-red-50 text-primary-700 border border-red-200 text-xs font-bold rounded-lg"
                  >
                    Class {fc} Fire
                  </span>
                ))}
                {product.capacity && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                    Capacity: {product.capacity}
                  </span>
                )}
                {product.certifications?.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 text-xs font-semibold rounded-lg"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Commercial Terms Card */}
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-dark font-display">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Save ₹{(product.price - product.discountPrice).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Prices exclude statutory 18% GST (calculated at checkout). Official B2B GST tax invoices issued for ITC claim.
              </p>

              {/* Stock status indicator */}
              <div className="mt-4 flex items-center gap-2">
                {product.stock > 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Ready Stock ({product.stock} units available)
                  </span>
                ) : product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="w-4 h-4" /> Low Stock: Only {product.stock} units left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertTriangle className="w-4 h-4" /> Currently Out of Stock (Available on order)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stock <= 0}
                    className="p-2.5 text-dark hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    className="p-2.5 text-dark hover:bg-slate-50 disabled:opacity-40 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {addedNotification && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-in fade-in">
                  <span>✓ Added {quantity} unit(s) to your cart.</span>
                  <Link to="/cart" className="underline font-bold hover:text-emerald-900">
                    View Cart &rarr;
                  </Link>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  leftIcon={<ShoppingCart className="w-4 h-4" />}
                >
                  Add to Cart
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleRequestQuote}
                  leftIcon={<FileSpreadsheet className="w-4 h-4 text-orange-400" />}
                >
                  Request Bulk Quote
                </Button>
              </div>

              {/* Direct WhatsApp Question */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <a
                  href={`https://wa.me/919800000000?text=Inquiry%20regarding%20${encodeURIComponent(product.name)}%20(SKU:%20${product.SKU})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-semibold hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Technical questions? WhatsApp an Engineer</span>
                </a>

                {product.datasheet && (
                  <a
                    href={product.datasheet}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-700 font-semibold hover:underline flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF Datasheet</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical Details: Specs, Features, Description, Reviews */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex border-b border-slate-200 gap-4 sm:gap-8 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
                activeTab === "specs"
                  ? "text-primary-700 border-b-2 border-primary-700"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
                activeTab === "features"
                  ? "text-primary-700 border-b-2 border-primary-700"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
                activeTab === "description"
                  ? "text-primary-700 border-b-2 border-primary-700"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              Description &amp; Applications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "text-primary-700 border-b-2 border-primary-700"
                  : "text-slate-500 hover:text-dark"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>Customer Reviews ({reviewsData?.total || 0})</span>
            </button>
          </div>

          <div className="py-8">
            {activeTab === "specs" && (
              <div className="max-w-3xl">
                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50/70">
                        <td className="py-3 px-4 font-bold text-dark w-1/3">Manufacturer / Brand</td>
                        <td className="py-3 px-4 text-slate-700">{product.brand}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-dark">Model / SKU</td>
                        <td className="py-3 px-4 text-slate-700 font-mono">
                          {product.modelNumber || product.SKU}
                        </td>
                      </tr>
                      {product.capacity && (
                        <tr className="bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-dark">Rated Capacity</td>
                          <td className="py-3 px-4 text-slate-700">{product.capacity}</td>
                        </tr>
                      )}
                      {product.weight && (
                        <tr>
                          <td className="py-3 px-4 font-bold text-dark">Gross Weight</td>
                          <td className="py-3 px-4 text-slate-700">{product.weight}</td>
                        </tr>
                      )}
                      {product.fireClass?.length > 0 && (
                        <tr className="bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-dark">Fire Class Coverage</td>
                          <td className="py-3 px-4 text-slate-700">{product.fireClass.join(", ")}</td>
                        </tr>
                      )}
                      {product.specifications?.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? "" : "bg-slate-50/70"}>
                          <td className="py-3 px-4 font-bold text-dark">{spec.key}</td>
                          <td className="py-3 px-4 text-slate-700">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="max-w-3xl">
                <ul className="space-y-3">
                  {product.features?.length ? (
                    product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No feature highlights specified.</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === "description" && (
              <div className="max-w-3xl text-sm leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
                {product.description}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-8">
                {/* Rating Summary Card */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid sm:grid-cols-3 gap-6 items-center">
                  <div className="text-center sm:text-left sm:border-r border-slate-200 sm:pr-6">
                    <span className="text-4xl sm:text-5xl font-extrabold font-display text-dark">
                      {reviewsData?.averageRating ? reviewsData.averageRating.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-slate-400 text-sm"> / 5.0</span>
                    <div className="flex justify-center sm:justify-start text-amber-500 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewsData?.averageRating || 5)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Based on {reviewsData?.total || 0} customer reviews
                    </p>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsData?.ratingDistribution?.[stars] || 0;
                      const total = reviewsData?.total || 1;
                      const percent = reviewsData?.total ? Math.round((count / total) * 100) : 0;

                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 text-slate-600 font-semibold">{stars} Stars</span>
                          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-slate-500 font-mono">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Action Bar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-display text-dark">
                    Verified Customer Feedback
                  </h3>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowReviewForm((v) => !v)}
                    leftIcon={<Star className="w-3.5 h-3.5" />}
                  >
                    {showReviewForm ? "Cancel Review" : "Write a Review"}
                  </Button>
                </div>

                {reviewSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 animate-in fade-in"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-dark font-display">Write a Product Review</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Share your technical experience with this safety equipment to assist facility managers.
                      </p>
                    </div>

                    {reviewErrorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                        {reviewErrorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Rating *
                      </label>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-amber-500 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoverRating || rating)
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-dark ml-2">
                          {hoverRating || rating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Review Headline / Summary *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Excellent ISI quality, installed in warehouse corridor"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-dark focus:border-primary-600 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Detailed Technical Feedback *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe cylinder weight, gauge readability, bracket durability, or delivery speed..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-dark focus:border-primary-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                        isLoading={isSubmittingReview}
                      >
                        Submit Technical Review
                      </Button>
                    </div>
                  </form>
                )}

                {/* Reviews Listing */}
                {!reviewsData || reviewsData.reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-dark">No Reviews Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Have you installed or operated this equipment? Be the first to submit a review!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-dark font-bold text-xs flex items-center justify-center">
                              {rev.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-dark block">{rev.userName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Purchase
                              </span>
                            )}
                            <div className="flex text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= rev.rating
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-dark">{rev.title}</h4>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rev.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200">
            <h2 className="text-xl font-bold font-display text-dark mb-6">
              Complementary Equipment in this Class
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct as any} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
