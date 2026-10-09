import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Zap, Check, Heart, ArrowLeftRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openCompare } = useStore();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(product.id);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isLowStock = product.stock > 0 && product.stock <= 15;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-xl dark:hover:border-stone-700 transition-all duration-300 flex flex-col relative">
      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-stone-50 dark:bg-stone-950">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-black text-[11px] px-2.5 py-1 rounded-full shadow-md z-10">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all shadow-md z-20 cursor-pointer ${
            inWishlist
              ? 'bg-rose-500 text-white scale-105'
              : 'bg-white/90 dark:bg-stone-900/90 backdrop-blur-md text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-stone-900'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 bg-stone-900/80 dark:bg-black/80 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full z-10 border border-white/10">
          {product.category}
        </span>

        {/* Stock Status Pill */}
        {isOutOfStock ? (
          <span className="absolute top-14 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-14 right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-xs">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Product Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Size */}
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-stone-800 dark:text-stone-200">{product.rating}</span>
              <span className="text-stone-400 dark:text-stone-500">({product.reviewCount})</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openCompare(product.size);
              }}
              title={`Compare ${product.size} nutrients with other sizes`}
              className="font-bold bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-900 dark:hover:text-amber-300 text-stone-700 dark:text-stone-300 px-2.5 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 hover:border-amber-300"
            >
              <ArrowLeftRight className="w-3 h-3 text-stone-500 dark:text-stone-400 hover:text-amber-700" />
              <span>{product.size}</span>
            </button>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">₹{product.price}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through">₹{product.compareAtPrice}</span>
            )}
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold ml-auto">
              {product.stock > 0 ? 'In Stock' : 'Unavailable'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
                isOutOfStock
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-98'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-xs whitespace-nowrap cursor-pointer ${
                isOutOfStock
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-800 dark:bg-emerald-700 text-white hover:bg-emerald-900 dark:hover:bg-emerald-600 active:scale-98'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
