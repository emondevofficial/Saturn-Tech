import React from 'react';
import { ShoppingCart, Heart, Scale, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-200">
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="pointer-events-auto text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.flashSale && (
            <span className="pointer-events-auto text-[10px] font-bold text-slate-900 bg-amber-400 px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wide">
              Flash Deal
            </span>
          )}
        </div>

        {/* Quick action buttons (Wishlist & Compare) */}
        <div className="flex flex-col gap-1.5 pointer-events-auto opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-1.5 rounded-lg border backdrop-blur-xs transition-colors shadow-xs ${
              isWishlisted
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-white/90 border-slate-200 text-slate-600 hover:text-rose-500'
            }`}
            title="Wishlist"
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCompare(product);
            }}
            className={`p-1.5 rounded-lg border backdrop-blur-xs transition-colors shadow-xs ${
              isCompared
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-white/90 border-slate-200 text-slate-600 hover:text-amber-600'
            }`}
            title="Compare"
            aria-label="Add to comparison"
          >
            <Scale className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Image Area */}
      <div
        onClick={() => onNavigate(`/products/${product.slug}`)}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 cursor-pointer mb-3"
      >
        <img
          src={product.images[0] || '/src/assets/images/hero_laptop_showcase_1790771906222.jpg'}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_laptop_showcase_1790771906222.jpg';
          }}
        />

        {/* Quick View Button overlay on hover */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 text-[11px] font-semibold text-slate-900 bg-white/95 px-3 py-1.5 rounded-lg shadow-md border border-slate-200 hover:bg-slate-100"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category Unboxed Separators */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 mb-1">
            <span className="uppercase tracking-wider font-semibold text-slate-700">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onNavigate(`/products/${product.slug}`)}
            className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer mb-1.5 leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Key Spec bullet if available */}
          {product.specifications.length > 0 && (
            <p className="text-[11px] text-slate-600 line-clamp-1 mb-2">
              {product.specifications[0]?.name}: {product.specifications[0]?.value}
            </p>
          )}

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-2.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-slate-800 tabular-nums">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-slate-600 text-[11px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Stock Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <div>
              <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums tracking-tight">
                ৳{product.salePrice.toLocaleString()}
              </div>
              {product.regularPrice > product.salePrice && (
                <div className="text-xs text-slate-600 line-through tabular-nums">
                  ৳{product.regularPrice.toLocaleString()}
                </div>
              )}
            </div>

            {/* Stock status text */}
            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-[11px] font-semibold text-rose-600">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-[11px] font-semibold text-amber-600">Only {product.stock} left</span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-600">In Stock</span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`w-full mt-2.5 py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0F172A] hover:bg-blue-600 text-white shadow-xs'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
