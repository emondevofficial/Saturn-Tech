import React, { useState } from 'react';
import { X, Star, ShoppingCart, Check, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Gallery Left */}
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={
                    product.images[selectedImage] ||
                    product.images[0] ||
                    '/src/assets/images/hero_laptop_showcase_1790771906222.jpg'
                  }
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-14 h-14 rounded-lg border p-1 bg-slate-50 overflow-hidden ${
                        selectedImage === i ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Right */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {product.brand} · {product.category}
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {product.name}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  SKU: <span className="font-mono text-slate-700">{product.sku}</span> · Warranty: {product.warranty}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({product.reviewCount} customer reviews)
                  </span>
                </div>

                {/* Price display */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    ৳{product.salePrice.toLocaleString()}
                  </span>
                  {product.regularPrice > product.salePrice && (
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      ৳{product.regularPrice.toLocaleString()}
                    </span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md">
                      {product.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Short description */}
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {product.shortDescription || product.description}
                </p>

                {/* Highlights */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <Check className="w-3.5 h-3.5" /> Official Warranty with Genuine Invoice
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Cash on Delivery Available
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      onClose();
                    }}
                    disabled={isOutOfStock}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-500'
                        : 'border-slate-200 text-slate-600 hover:text-rose-500 hover:bg-slate-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigate(`/products/${product.slug}`);
                  }}
                  className="w-full text-center text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  View Full Product Specifications & Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
