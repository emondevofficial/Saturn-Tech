import React from 'react';
import { Scale, X, ShoppingCart, Check, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

interface ComparePageProps {
  onNavigate: (path: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No Products in Comparison</h1>
        <p className="text-xs text-slate-500">
          Click the compare icon on any laptop, CPU, or GPU card to compare hardware specifications side by side.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
        >
          Browse Hardware
        </button>
      </div>
    );
  }

  // Collect all unique specification names across the compared products
  const allSpecNames = Array.from(
    new Set(
      compareList.flatMap((p) => p.specifications.map((s) => s.name))
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hardware Comparison ({compareList.length}/4)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Side-by-side technical breakdown of selected components
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Comparison
        </button>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 w-48 text-slate-500 font-bold uppercase tracking-wider bg-slate-50 rounded-l-2xl">
                Attribute
              </th>
              {compareList.map((product) => (
                <th key={product.id} className="p-3 min-w-[220px] max-w-[260px] align-top">
                  <div className="space-y-3 relative p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="aspect-[4/3] bg-white rounded-xl p-2 flex items-center justify-center">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-blue-600 uppercase">
                        {product.brand}
                      </div>
                      <h3
                        onClick={() => onNavigate(`/products/${product.slug}`)}
                        className="font-bold text-slate-900 line-clamp-2 hover:text-blue-600 cursor-pointer mt-0.5"
                      >
                        {product.name}
                      </h3>
                      <div className="text-base font-extrabold text-slate-900 mt-1 tabular-nums">
                        ৳{product.salePrice.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product, 1)}
                      disabled={product.stock <= 0}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* Price */}
            <tr>
              <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Price</td>
              {compareList.map((p) => (
                <td key={p.id} className="p-3 font-extrabold text-slate-900 text-sm tabular-nums">
                  ৳{p.salePrice.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Category</td>
              {compareList.map((p) => (
                <td key={p.id} className="p-3 text-slate-800">
                  {p.category}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr>
              <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Official Warranty</td>
              {compareList.map((p) => (
                <td key={p.id} className="p-3 text-emerald-700 font-semibold">
                  {p.warranty}
                </td>
              ))}
            </tr>

            {/* Stock Availability */}
            <tr>
              <td className="p-3 font-bold text-slate-700 bg-slate-50/50">Stock Availability</td>
              {compareList.map((p) => (
                <td key={p.id} className="p-3">
                  {p.stock > 0 ? (
                    <span className="text-emerald-600 font-semibold">In Stock ({p.stock})</span>
                  ) : (
                    <span className="text-rose-600 font-semibold">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Dynamically collected specifications */}
            {allSpecNames.map((specName) => (
              <tr key={specName}>
                <td className="p-3 font-bold text-slate-700 bg-slate-50/50">{specName}</td>
                {compareList.map((p) => {
                  const specObj = p.specifications.find((s) => s.name === specName);
                  return (
                    <td key={p.id} className="p-3 text-slate-800">
                      {specObj ? specObj.value : <span className="text-slate-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
