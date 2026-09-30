import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  Scale,
  Share2,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailsPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  slug,
  onNavigate,
  onQuickView,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { success, error, showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setProduct(data.data.product);
          setRelated(data.data.related || []);
          setSelectedImage(0);
          setQuantity(1);

          // Fetch reviews
          fetch(`/api/reviews/${data.data.product.id}`)
            .then((res) => res.json())
            .then((rData) => {
              if (rData.success) setReviews(rData.data || []);
            })
            .catch(() => {});
        }
      })
      .catch((err) => console.error('Product fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-sm font-semibold text-slate-700">Loading Product Specifications...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested hardware item may have been moved or is no longer listed.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleBuyNow = () => {
    const added = addToCart(product, quantity);
    if (added) {
      onNavigate('/checkout');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product URL copied to clipboard!', 'success');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      error('Please write your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('saturn_token')}` } : {}),
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment,
          customerName: user?.name || 'Verified Customer',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        success('Review submitted successfully! Thank you for your feedback.');
        setReviews([data.data, ...reviews]);
        setNewComment('');
        setNewRating(5);
      } else {
        error(data.message || 'Failed to submit review');
      }
    } catch {
      error('Network error submitting review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Group specifications dynamically
  const specGroups: Record<string, { name: string; value: string }[]> = {};
  product.specifications.forEach((s) => {
    const grp = s.group || 'General';
    if (!specGroups[grp]) specGroups[grp] = [];
    specGroups[grp].push({ name: s.name, value: s.value });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb unboxed */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('/')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate(`/products?category=${product.categorySlug}`)}
          className="hover:text-slate-900"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Primary Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl bg-white border border-slate-200 p-6 flex items-center justify-center overflow-hidden shadow-xs">
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 text-xs font-bold text-white bg-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wide shadow-xs">
                {product.discountPercentage}% OFF
              </span>
            )}
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl border p-2 bg-white shrink-0 overflow-hidden cursor-pointer transition-all ${
                    selectedImage === idx
                      ? 'border-blue-600 ring-2 ring-blue-600/30'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module Column (7 cols) */}
        <div className="lg:col-span-6 space-y-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div>
            {/* Brand · Category unboxed */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span className="text-blue-600 font-bold">{product.brand}</span>
              <span>·</span>
              <span>{product.category}</span>
              {product.subcategory && (
                <>
                  <span>·</span>
                  <span>{product.subcategory}</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Metadata */}
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  {product.averageRating.toFixed(1)}
                </span>
                <span>({product.reviewCount} customer ratings)</span>
              </div>
              <span>·</span>
              <div>
                SKU: <span className="font-mono text-slate-700">{product.sku}</span>
              </div>
              <span>·</span>
              <div>
                Code: <span className="font-mono text-slate-700">{product.productCode}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Price in Bangladesh:</div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  ৳{product.salePrice.toLocaleString()}
                </span>
                {product.regularPrice > product.salePrice && (
                  <span className="text-base text-slate-400 line-through tabular-nums">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  Out of Stock
                </div>
              ) : isLowStock ? (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Only {product.stock} units left
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock ({product.stock} available)
                </div>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Quantity and Primary CTAs */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm text-slate-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </button>

              {/* Buy Now button */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                Buy Now
              </button>
            </div>

            {/* Auxiliary actions (Wishlist, Compare, Share) */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>

              <button
                onClick={() => addToCompare(product)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isCompared
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                {isCompared ? 'In Compare List' : 'Compare'}
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delivery & Warranty Service Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Warranty:</span>
                <p className="text-slate-500 mt-0.5">{product.warranty}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Chattogram Delivery:</span>
                <p className="text-slate-500 mt-0.5">Same-day express (৳70) or Free over ৳50,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description Tabs Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            Technical Specifications
          </h2>

          <div className="space-y-6">
            {Object.keys(specGroups).length > 0 ? (
              Object.entries(specGroups).map(([groupTitle, specs]) => (
                <div key={groupTitle} className="space-y-2">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {groupTitle}
                  </h3>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {specs.map((item, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-1 sm:grid-cols-3 p-3 text-xs ${
                          idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <span className="font-semibold text-slate-700">{item.name}</span>
                        <span className="sm:col-span-2 text-slate-900 mt-0.5 sm:mt-0 font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">Standard specifications apply.</p>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
            Product Overview & Features
          </h2>
          <div className="prose text-xs sm:text-sm text-slate-600 leading-relaxed max-w-none space-y-4">
            <p>{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Key Highlights:</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  {product.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Customer Reviews & Ratings ({reviews.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic reviews from verified buyers across Bangladesh
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {product.averageRating.toFixed(1)}
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-700">No reviews yet</div>
                  <p className="text-[11px] text-slate-500">
                    Be the first verified customer to share your thoughts on this product!
                  </p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold uppercase">
                          {rev.customerName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a review form (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Write a Product Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? 'text-amber-400 fill-current' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Review Details
                  </label>
                  <textarea
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience regarding performance, build quality, thermals, or packaging..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Related Products</h2>
            <button
              onClick={() => onNavigate(`/products?category=${product.categorySlug}`)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View More in {product.category} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
