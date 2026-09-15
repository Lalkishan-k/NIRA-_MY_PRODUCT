import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Droplets,
  Heart,
  Share2,
  Minus,
  Plus,
  ArrowLeft,
  Sparkles,
  ArrowLeftRight,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';
import { Product, Review, ProductSize } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { CustomerReviews } from '../components/CustomerReviews';
import { PincodeDeliveryEstimator } from '../components/PincodeDeliveryEstimator';
import { NutritionalChart } from '../components/NutritionalChart';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, addToast, settings, openCompare } = useStore();
  const { customerProfile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'benefits' | 'specs' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const found = products.find(p => p.slug === slug || p.id === slug);
    if (found) {
      setProduct(found);
      setSelectedImage(found.images[0]);
      setQuantity(1);
    } else {
      // Fetch directly from API
      api.getProduct(slug).then(p => {
        setProduct(p);
        setSelectedImage(p.images[0]);
      }).catch(() => {
        navigate('/shop');
      });
    }
  }, [slug, products, navigate]);

  useEffect(() => {
    if (product) {
      setIsLoadingReviews(true);
      api.getReviews(product.id).then(revs => {
        setReviews(revs);
      }).finally(() => {
        setIsLoadingReviews(false);
      });
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 text-sm">Loading authentic coconut oil details...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(currentUrl)
        .then(() => {
          setIsCopied(true);
          addToast('Product link copied to clipboard!', 'success');
          setTimeout(() => setIsCopied(false), 2500);
        })
        .catch(() => {
          fallbackCopyText(currentUrl);
        });
    } else {
      fallbackCopyText(currentUrl);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      addToast('Product link copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      addToast('Could not copy link automatically.', 'error');
    }
  };

  const handleWhatsAppShare = () => {
    const currentUrl = window.location.href;
    const text = `🥥 *${product.name}* (100% Unfiltered Pure Kerala Coconut Oil)\n\nPrice: ₹${product.price} (${product.size})\n\n${product.shortDescription}\n\n👉 Order directly here: ${currentUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} (100% Unfiltered Pure Kerala Coconut Oil):`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleReviewSubmit = async (reviewData: { rating: number; title: string; review: string; customerName: string }) => {
    try {
      const created = await api.submitReview({
        productId: product.id,
        rating: reviewData.rating,
        title: reviewData.title,
        review: reviewData.review,
        customerName: reviewData.customerName,
        customerId: customerProfile?.uid || 'guest'
      });
      setReviews([created, ...reviews]);
      addToast('Thank you! Your verified review has been published.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit review', 'error');
      throw err;
    }
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id);

  const isLowStock = product.stock > 0 && product.stock <= 15;
  const isOutOfStock = product.stock <= 0;

  const pageTitle = `${product.name} (${product.size}) | 100% Pure Unfiltered Kerala Coconut Oil - NIRA`;
  const pageDescription = product.shortDescription || product.description || `Pure unfiltered cold pressed coconut oil (${product.size}) direct from Kerala farms. Maximum Vitamin E, healthy MCTs, and natural coconut aroma.`;
  const canonicalUrl = `https://nira.farm/product/${product.slug}`;
  const primaryImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1200';
  const keywordsList = `NIRA Coconut Oil, ${product.name}, ${product.size}, Kerala coconut oil, wood pressed coconut oil, cold pressed, unfiltered, hair oil, cooking oil, pure coconut oil, ${product.ingredients?.join(', ') || '100% pure coconut oil'}`;

  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${product.name} (${product.size})`,
    "image": product.images,
    "description": pageDescription,
    "sku": product.sku || `NIRA-${product.size.replace(/\s+/g, '')}`,
    "mpn": product.id,
    "brand": {
      "@type": "Brand",
      "name": "NIRA Pure Coconut Oil"
    },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "NIRA Pure Coconut Oil"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.reviewCount || (reviews.length > 0 ? reviews.length : 1),
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Dynamic SEO Meta Tags via React Helmet */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywordsList} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} (${product.size}) - NIRA Pure Coconut Oil`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:image:alt" content={`${product.name} - ${product.size}`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="NIRA Pure Coconut Oil" />
        <meta property="product:price:amount" content={String(product.price)} />
        <meta property="product:price:currency" content="INR" />
        <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
        <meta property="product:brand" content="NIRA" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} (${product.size}) | NIRA Pure Coconut Oil`} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={primaryImage} />

        {/* Structured Data (Schema.org / Product) */}
        <script type="application/ld+json">
          {JSON.stringify(schemaJson)}
        </script>
      </Helmet>

      {/* Back button */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Oils</span>
      </Link>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden border border-stone-200 bg-stone-50 shadow-xs relative">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.discount && product.discount > 0 && (
              <span className="absolute top-4 left-4 bg-amber-500 text-stone-950 font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === img
                      ? 'border-emerald-800 ring-2 ring-emerald-800/20'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="text-stone-400 hover:text-emerald-700 p-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                  title={isCopied ? 'Link Copied!' : 'Copy Link'}
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-stone-900 ml-1">{product.rating}</span>
              </div>
              <span className="text-stone-400 text-xs">•</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-stone-500 hover:text-emerald-800 underline underline-offset-2"
              >
                {product.reviewCount} customer ratings
              </button>
            </div>
          </div>

          {/* Live Stock Urgency Badge */}
          <div className="flex items-center gap-2">
            {product.stock <= 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Currently Out of Stock
              </span>
            ) : product.stock <= 10 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                🔥 Hurry, only {product.stock} left in freshly pressed batch!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                In Stock ({product.stock} units available) — Ready to Dispatch
              </span>
            )}
          </div>

          {/* Pricing Block */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">₹{product.price}</span>
            {product.compareAtPrice && (
              <span className="text-xs sm:text-sm text-stone-400 line-through">₹{product.compareAtPrice}</span>
            )}
            {product.discount && (
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                Save ₹{(product.compareAtPrice || 0) - product.price} ({product.discount}%)
              </span>
            )}
            <span className="text-[11px] sm:text-xs text-stone-500 sm:ml-auto w-full sm:w-auto mt-1 sm:mt-0">Inclusive of all taxes</span>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{product.shortDescription}</p>

          {/* 3 Packaging Sizes Switcher */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Choose Packaging Size
              </label>
              <button
                type="button"
                onClick={() => openCompare(product.size)}
                className="text-[11px] sm:text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-700" />
                <span>Compare Nutrient Profiles</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {(['200 ml', '500 ml', '1 Litre'] as const).map(sz => {
                const match = products.find(p => p.size === sz);
                const isCurrent = product.size === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      if (match && match.slug !== product.slug) {
                        navigate(`/product/${match.slug}`);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all ${
                      isCurrent
                        ? 'border-emerald-800 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-800/10'
                        : 'border-stone-200 bg-white hover:border-emerald-600 text-stone-700 font-medium'
                    }`}
                  >
                    <div className="text-xs font-bold">{sz}</div>
                    <div className="text-[10px] sm:text-[11px] text-stone-500 font-normal">
                      {match ? `₹${match.price}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unfiltered Nutrient Advantage Highlight Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Why Unfiltered? More Living Nutrients</span>
            </div>
            <p className="text-[12px] text-amber-950/80 leading-relaxed">
              Commercial micro-filters strip out vital micronutrients, plant sterols, and Vitamin E to produce artificial transparency. Our oil settles naturally under gentle gravity without filtration — keeping 100% of the active antioxidants, rich lauric acid, and authentic Kerala roasted bouquet intact.
            </p>
          </div>

          {/* Stock & Quantity Controller */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700">Quantity</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-bold">Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-bold">Hurry, only {product.stock} units left!</span>
              ) : (
                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Dispatch
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock || quantity <= 1}
                  className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={isOutOfStock || quantity >= product.stock}
                  className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-stone-500">
                Subtotal: <b className="text-stone-900 text-sm">₹{product.price * quantity}</b>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-100 text-stone-900 hover:bg-stone-200 active:scale-98'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Basket</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isOutOfStock
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-98'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>

          {/* Instant PIN Code Delivery Estimator Widget */}
          <PincodeDeliveryEstimator />

          {/* Social Sharing Component: WhatsApp & Copy Link */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                <Share2 className="w-3.5 h-3.5 text-emerald-800" />
                <span>Share Product with Friends & Family</span>
              </div>
              <span className="text-[11px] text-stone-500">100% Pure Kerala Oil</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* WhatsApp Direct Share Button */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                title="Share product link directly on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200 fill-emerald-200/20" />
                <span>Share on WhatsApp</span>
              </button>

              {/* Copy Product Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300 hover:border-stone-400'
                }`}
                title="Copy product link to clipboard"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-800 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-600" />
                    <span>Copy Product Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Value props & shipping notes */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 grid grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Free delivery on ₹499+</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Sulphur & Chemical Free</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Cold Expeller Pressed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>Authentic Kerala Origin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Nutritional Super-Superiority Chart Section */}
      <div className="pt-2">
        <NutritionalChart />
      </div>

      {/* Detailed Specifications & Reviews Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-stone-200 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'description', label: 'Full Description' },
            { id: 'benefits', label: 'Health Benefits & Usage' },
            { id: 'specs', label: 'Lab Specs & Origin' },
            { id: 'reviews', label: `Reviews (${reviews.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'border-emerald-800 text-emerald-900 bg-stone-50/50'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl text-sm text-stone-700 leading-relaxed">
              <p>{product.description}</p>
              <div className="pt-4">
                <h4 className="font-bold text-stone-900 mb-2">Storage Instructions:</h4>
                <p className="text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                  {product.storage}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div>
                <h4 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  Key Health & Nutrient Benefits
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-800" />
                  Recommended Daily Applications
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600">
                  {product.usage.map((u, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-2 p-3 bg-stone-50 font-semibold text-stone-800">
                  <span>Extraction Method</span>
                  <span className="text-stone-600">{product.specifications?.extractionMethod}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span>Shelf Life</span>
                  <span className="text-stone-600">{product.specifications?.shelfLife}</span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-stone-50">
                  <span>Aroma & Flavor Profile</span>
                  <span className="text-stone-600">{product.specifications?.aroma}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span>Smoke Point</span>
                  <span className="text-stone-600">{product.specifications?.smokePoint}</span>
                </div>
                <div className="grid grid-cols-2 p-3 bg-stone-50">
                  <span>Copra Origin</span>
                  <span className="text-stone-600">{product.specifications?.source}</span>
                </div>
                <div className="grid grid-cols-2 p-3">
                  <span>FSSAI Central License</span>
                  <span className="text-stone-600 font-mono font-semibold text-emerald-800">
                    {product.specifications?.fssaiLicense}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <CustomerReviews
              productId={product.id}
              productName={product.name}
              reviews={reviews}
              isLoading={isLoadingReviews}
              onSubmitReview={handleReviewSubmit}
            />
          )}
        </div>
      </div>

      {/* Other Packaging Sizes Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">Other Packaging Sizes</h3>
              <p className="text-xs text-stone-500 mt-0.5">Same 100% Unfiltered Pure Oil, available in other sizes.</p>
            </div>
            <button
              type="button"
              onClick={() => openCompare(product.size)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 hover:underline"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Compare All Sizes Side-by-Side</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
