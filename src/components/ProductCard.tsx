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
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col relative">
      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-stone-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount && product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-xs z-10">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs z-20 ${
            inWishlist
              ? 'bg-rose-500 text-white scale-105'
              : 'bg-white/90 backdrop-blur-xs text-stone-600 hover:text-rose-600 hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full z-10">
          {product.category}
        </span>

        {/* Stock Status Pill */}
        {isOutOfStock ? (
          <span className="absolute top-14 right-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="absolute top-14 right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Product Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Size */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-stone-800">{product.rating}</span>
              <span className="text-stone-400">({product.reviewCount})</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openCompare(product.size);
              }}
              title={`Compare ${product.size} nutrients with other sizes`}
              className="font-semibold bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 px-2.5 py-0.5 rounded-md text-[11px] flex items-center gap-1 transition-colors cursor-pointer border border-stone-200/80 hover:border-amber-300"
            >
              <ArrowLeftRight className="w-3 h-3 text-stone-500 hover:text-amber-700" />
              <span>{product.size}</span>
            </button>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-extrabold text-stone-900">₹{product.price}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">₹{product.compareAtPrice}</span>
            )}
            <span className="text-[11px] text-emerald-800 font-medium ml-auto">
              {product.stock > 0 ? 'In Stock' : 'Unavailable'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
