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
  Share2,
  FileSpreadsheet,
  Heart,
  Star,
  User,
  Loader2,
  MessageSquare,
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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-steel text-sm">Loading product details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-display text-ink mb-2">Product Not Found</h2>
        <p className="text-steel text-sm mb-6">
          The requested fire safety product could not be located in our catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded text-sm font-semibold hover:bg-brand-dark"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
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
        "Thank you! Your review has been submitted and is pending safety moderation. It will be published shortly."
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
        title={`${product.name} — AK Fire Safety Service Navi Mumbai`}
        description={product.shortDescription || product.description}
      />

      <div className="bg-paper border-b border-black/10 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 text-xs text-steel">
          <Link to="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-ink">
            Catalog
          </Link>
          {Boolean(product.category && typeof product.category === "object") && (
            <>
              <span>/</span>
              <Link to={`/products/${(product.category as any).slug}`} className="hover:text-ink">
                {(product.category as any).name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-ink font-semibold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Column: Image Gallery */}
          <div>
            <div className="aspect-square bg-white border border-black/10 rounded-lg overflow-hidden flex items-center justify-center p-6 shadow-sm relative">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => toggleItem(product._id)}
                className={`absolute top-4 right-4 p-2.5 rounded-full border shadow-sm transition-colors ${
                  isFavorited
                    ? "bg-red-50 border-red-200 text-brand"
                    : "bg-white/90 border-black/10 text-steel hover:text-brand hover:bg-white"
                }`}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-brand" : ""}`} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded border p-1 shrink-0 bg-white transition-all ${
                      selectedImageIndex === idx
                        ? "border-brand ring-2 ring-brand/20"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} preview ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-black/10 text-center">
              <div className="p-3 bg-white rounded border border-black/10">
                <ShieldCheck className="w-5 h-5 text-brand mx-auto mb-1" />
                <p className="text-[11px] font-bold text-ink">ISI Certified</p>
                <p className="text-[10px] text-steel">BIS Code Tested</p>
              </div>
              <div className="p-3 bg-white rounded border border-black/10">
                <Truck className="w-5 h-5 text-brand mx-auto mb-1" />
                <p className="text-[11px] font-bold text-ink">Prompt Delivery</p>
                <p className="text-[10px] text-steel">Mumbai & MMR</p>
              </div>
              <div className="p-3 bg-white rounded border border-black/10">
                <CheckCircle2 className="w-5 h-5 text-brand mx-auto mb-1" />
                <p className="text-[11px] font-bold text-ink">AMC Ready</p>
                <p className="text-[10px] text-steel">Scheduled Visits</p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs text-steel mb-2">
              <span className="font-bold text-brand uppercase tracking-wider">{product.brand}</span>
              <span>SKU: {product.SKU}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-tight">
              {product.name}
            </h1>

            {/* Ratings Summary in Hero */}
            {reviewsData && reviewsData.total > 0 ? (
              <div
                className="flex items-center gap-2 mt-2 cursor-pointer group"
                onClick={() => setActiveTab("reviews")}
              >
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(reviewsData.averageRating)
                          ? "fill-amber-400 text-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-ink">{reviewsData.averageRating.toFixed(1)}</span>
                <span className="text-xs text-steel group-hover:text-brand transition-colors">
                  ({reviewsData.total} verified review{reviewsData.total > 1 ? "s" : ""})
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab("reviews");
                  setShowReviewForm(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline mt-2"
              >
                <Star className="w-3.5 h-3.5" /> Be the first to review this product
              </button>
            )}

            {product.shortDescription && (
              <p className="text-steel text-sm mt-3 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Badges & Fire Classes */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {product.fireClass?.map((fc) => (
                <span
                  key={fc}
                  className="px-2.5 py-1 bg-red-50 text-brand border border-red-200 text-xs font-bold rounded"
                >
                  {fc}
                </span>
              ))}
              {product.capacity && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                  Capacity: {product.capacity}
                </span>
              )}
              {product.certifications?.map((cert) => (
                <span
                  key={cert}
                  className="px-2.5 py-1 bg-amber/15 text-ink border border-amber/30 text-xs font-semibold rounded"
                >
                  {cert}
                </span>
              ))}
            </div>

            {/* Price Card */}
            <div className="mt-6 p-4 bg-paper rounded-lg border border-black/10">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-ink font-display">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-base text-steel line-through">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-steel mt-1">
                Prices exclude 18% GST (applied at checkout). B2B GST invoices provided for ITC.
              </p>

              {/* Stock status */}
              <div className="mt-3 flex items-center gap-2">
                {product.stock > 10 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} units available)
                  </span>
                ) : product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <AlertTriangle className="w-4 h-4" /> Only {product.stock} left in stock - order soon
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                    <AlertTriangle className="w-4 h-4" /> Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
                  Quantity
                </span>
                <div className="flex items-center border border-black/20 rounded bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || product.stock <= 0}
                    className="p-2 text-ink hover:bg-paper disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    className="p-2 text-ink hover:bg-paper disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {addedNotification && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded flex items-center justify-between">
                  <span>✓ Added {quantity} unit(s) to your cart.</span>
                  <Link to="/cart" className="underline font-bold">
                    View Cart
                  </Link>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="py-3 px-5 bg-brand hover:bg-brand-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>

                <button
                  onClick={handleRequestQuote}
                  className="py-3 px-5 bg-ink hover:bg-black text-white font-semibold text-sm rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber" /> Request Bulk B2B Quote
                </button>
              </div>

              {/* Wishlist toggle action */}
              <button
                onClick={() => toggleItem(product._id)}
                className={`w-full py-2.5 px-4 rounded border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isFavorited
                    ? "bg-red-50 border-red-200 text-brand"
                    : "bg-white border-black/15 text-ink hover:bg-paper"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-brand" : ""}`} />
                <span>{isFavorited ? "Saved in Your Wishlist" : "Add to Wishlist for Facility Review"}</span>
              </button>

              {product.datasheet && (
                <a
                  href={product.datasheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline font-semibold mt-2"
                >
                  <FileText className="w-4 h-4" /> Download Product Technical Datasheet (PDF)
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Technical Details Tabs: Specifications, Features, Description, Reviews */}
        <div className="mt-14 pt-8 border-t border-black/10">
          <div className="flex border-b border-black/10 gap-6 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase transition-colors shrink-0 ${
                activeTab === "specs"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase transition-colors shrink-0 ${
                activeTab === "features"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase transition-colors shrink-0 ${
                activeTab === "description"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              Description & Usage
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-bold tracking-wide uppercase transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "text-brand border-b-2 border-brand"
                  : "text-steel hover:text-ink"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Customer Reviews ({reviewsData?.total || 0})
            </button>
          </div>

          <div className="py-6">
            {activeTab === "specs" && (
              <div className="max-w-3xl">
                <table className="w-full text-xs sm:text-sm text-left border border-black/10 rounded overflow-hidden">
                  <tbody>
                    <tr className="bg-paper border-b border-black/10">
                      <td className="py-2.5 px-4 font-semibold text-ink w-1/3">Brand</td>
                      <td className="py-2.5 px-4 text-steel">{product.brand}</td>
                    </tr>
                    <tr className="border-b border-black/10">
                      <td className="py-2.5 px-4 font-semibold text-ink">Model / SKU</td>
                      <td className="py-2.5 px-4 text-steel">
                        {product.modelNumber || product.SKU}
                      </td>
                    </tr>
                    {product.capacity && (
                      <tr className="bg-paper border-b border-black/10">
                        <td className="py-2.5 px-4 font-semibold text-ink">Capacity</td>
                        <td className="py-2.5 px-4 text-steel">{product.capacity}</td>
                      </tr>
                    )}
                    {product.weight && (
                      <tr className="border-b border-black/10">
                        <td className="py-2.5 px-4 font-semibold text-ink">Gross Weight</td>
                        <td className="py-2.5 px-4 text-steel">{product.weight}</td>
                      </tr>
                    )}
                    {product.fireClass?.length > 0 && (
                      <tr className="bg-paper border-b border-black/10">
                        <td className="py-2.5 px-4 font-semibold text-ink">Fire Rating / Class</td>
                        <td className="py-2.5 px-4 text-steel">{product.fireClass.join(", ")}</td>
                      </tr>
                    )}
                    {product.specifications?.map((spec, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "border-b border-black/10" : "bg-paper border-b border-black/10"}
                      >
                        <td className="py-2.5 px-4 font-semibold text-ink">{spec.key}</td>
                        <td className="py-2.5 px-4 text-steel">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "features" && (
              <div className="max-w-3xl">
                <ul className="space-y-3">
                  {product.features?.length ? (
                    product.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink/90">
                        <CheckCircle2 className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-steel">No feature list specified.</li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === "description" && (
              <div className="max-w-3xl text-sm leading-relaxed text-ink/90 whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Reviews & Ratings Tab */}
            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-8">
                {/* Rating Summary Card */}
                <div className="bg-paper p-6 rounded-xl border border-black/10 grid sm:grid-cols-3 gap-6 items-center">
                  <div className="text-center sm:text-left sm:border-r border-black/10 sm:pr-6">
                    <span className="text-4xl sm:text-5xl font-display font-bold text-ink">
                      {reviewsData?.averageRating ? reviewsData.averageRating.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-steel text-sm"> / 5.0</span>
                    <div className="flex justify-center sm:justify-start text-amber-500 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewsData?.averageRating || 5)
                              ? "fill-amber-400 text-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-steel mt-1">
                      Based on {reviewsData?.total || 0} customer reviews
                    </p>
                  </div>

                  {/* Distribution Bars */}
                  <div className="space-y-1.5 sm:col-span-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsData?.ratingDistribution?.[stars] || 0;
                      const total = reviewsData?.total || 1;
                      const percent = reviewsData?.total ? Math.round((count / total) * 100) : 0;

                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 text-steel font-medium">{stars} Stars</span>
                          <div className="flex-1 bg-black/5 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-steel font-mono">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Action Bar */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-display text-ink">
                    Verified Customer Feedback
                  </h3>
                  <button
                    onClick={() => setShowReviewForm((v) => !v)}
                    className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    {showReviewForm ? "Cancel Review" : "Write a Review"}
                  </button>
                </div>

                {reviewSuccessMsg && (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="bg-white border border-brand/30 rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="border-b border-black/10 pb-3">
                      <h4 className="font-bold text-sm text-ink">Write a Product Review</h4>
                      <p className="text-xs text-steel mt-0.5">
                        Share your technical experience with this equipment to assist building safety committees.
                      </p>
                    </div>

                    {reviewErrorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {reviewErrorMsg}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1.5">
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
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-ink ml-2">
                          {hoverRating || rating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Review Headline / Summary *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="e.g. Excellent ISI quality, ideal for office corridors"
                        className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">
                        Detailed Feedback & Performance *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe cylinder weight, gauge readability, bracket durability, or delivery speed..."
                        className="w-full px-3 py-2 border border-black/20 rounded text-xs focus:border-brand outline-none"
                      />
                    </div>

                    <div className="p-3 bg-paper rounded border border-black/5 text-[11px] text-steel">
                      <p className="flex items-center gap-1.5 font-semibold text-ink mb-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand" /> Safety Compliance Review Policy
                      </p>
                      <p>
                        Reviews are verified against genuine purchases to guarantee technical integrity.
                        Submitted reviews undergo moderator verification before publication.
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 border border-black/15 text-ink hover:bg-paper rounded text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-5 py-2 bg-brand hover:bg-brand-dark text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                          </>
                        ) : (
                          "Submit Review"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews Listing */}
                {!reviewsData || reviewsData.reviews.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-black/10 rounded-xl p-6">
                    <MessageSquare className="w-10 h-10 text-steel/40 mx-auto mb-2" />
                    <h4 className="font-bold text-sm text-ink">No Reviews Yet</h4>
                    <p className="text-xs text-steel mt-1 max-w-sm mx-auto">
                      Have you installed or operated this equipment at your premises? Be the first to share an evaluation!
                    </p>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="mt-4 px-4 py-2 bg-brand text-white rounded text-xs font-semibold hover:bg-brand-dark"
                    >
                      Leave a Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-paper border border-black/10 flex items-center justify-center text-ink font-bold text-xs">
                              {rev.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-ink block">{rev.userName}</span>
                              <span className="text-[10px] text-steel">
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
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                <ShieldCheck className="w-3 h-3 text-green-700" /> Verified Buyer
                              </span>
                            )}
                            <div className="flex text-amber-500">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= rev.rating
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-ink">{rev.title}</h4>
                          <p className="text-xs text-steel mt-1.5 leading-relaxed">{rev.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t border-black/10">
            <h2 className="text-xl font-display font-bold text-ink mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
