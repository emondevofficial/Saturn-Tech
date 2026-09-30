import React from 'react';
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Wishlist is Empty</h1>
        <p className="text-xs text-slate-500">
          Save your favorite laptops, GPUs, or peripherals to easily track price changes and purchase later.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Saved Wishlist ({wishlist.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review saved products and add directly to your shopping cart
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlist.map((product) => {
          const isOutOfStock = product.stock <= 0;
          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div
                onClick={() => onNavigate(`/products/${product.slug}`)}
                className="aspect-[4/3] rounded-xl bg-slate-50 p-2 flex items-center justify-center cursor-pointer"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">
                  {product.brand} · {product.category}
                </div>
                <h3
                  onClick={() => onNavigate(`/products/${product.slug}`)}
                  className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 cursor-pointer mt-0.5"
                >
                  {product.name}
                </h3>

                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    ৳{product.salePrice.toLocaleString()}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      isOutOfStock ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => moveToCart(product)}
                  disabled={isOutOfStock}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
