import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, toggleWishlist, clearWishlist, isWishlistOpen, setIsWishlistOpen } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <h3 className="font-serif font-bold text-stone-900">My Wishlist ({wishlist.length})</h3>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlist.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-400">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-stone-900">Your wishlist is empty</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Save your favorite pure Kerala coconut oils and organic skincare items here for later!
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Explore Shop
                </button>
              </div>
            ) : (
              wishlist.map(product => (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 rounded-2xl border border-stone-200 bg-white shadow-2xs items-center relative group"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-stone-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={() => setIsWishlistOpen(false)}
                      className="font-serif font-bold text-xs text-stone-900 hover:text-emerald-800 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs font-bold text-stone-800">₹{product.price}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          addToCart(product, 1);
                          setIsWishlistOpen(false);
                        }}
                        className="px-3 py-1 bg-emerald-800 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-900 transition-colors flex items-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add to Cart
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="text-stone-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="flex justify-between items-center text-xs text-stone-500">
                <span>{wishlist.length} item(s) saved</span>
                <button
                  onClick={clearWishlist}
                  className="text-rose-600 hover:underline font-semibold"
                >
                  Clear All
                </button>
              </div>
              <button
                onClick={() => {
                  wishlist.forEach(p => addToCart(p, 1));
                  setIsWishlistOpen(false);
                }}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Move All to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
