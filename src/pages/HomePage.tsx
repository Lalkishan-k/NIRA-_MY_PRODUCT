import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Droplets,
  Heart,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  Truck,
  Leaf,
  Clock,
  Star,
  Play,
  Pause,
  RotateCcw,
  Film,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { FaqAccordion } from '../components/FaqAccordion';
import { ElaOfficialLogo } from '../components/ElaOfficialLogo';
import { ProductSize } from '../types';
import {
  heroCoconutOil,
  pureOilBottle,
  keralaCooking,
  niraKeralaCooking,
  keralaCoconutGrove,
  coconutHarvest,
  childPureOil,
  niraOilBottle,
  niraPure1LBottle,
  niraPouch200ml,
  niraBottle500ml,
  productRotationVideo,
  unfilteredVideo
} from '../assets/images';

export const HomePage: React.FC = () => {
  const { products, isLoadingProducts, settings } = useStore();
  const { addToCart, setIsCartDrawerOpen } = useCart();
  const [selectedHeroSize, setSelectedHeroSize] = useState<ProductSize>('500 ml');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [customVideoSrc, setCustomVideoSrc] = useState<string>(unfilteredVideo);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [tempVideoUrl, setTempVideoUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setCustomVideoSrc(unfilteredVideo);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const featuredProducts = products.filter(p => p.featured && p.active).slice(0, 4);

  // Active hero product based on selected size
  const heroProduct = products.find(p => p.size === selectedHeroSize) || products[0] || {
    id: 'prod-pco-500ml',
    name: 'ELA naturals Unfiltered Pure Coconut Oil — 500 ml',
    slug: 'unfiltered-pure-coconut-oil-500ml',
    price: 225,
    compareAtPrice: 275,
    discount: 18,
    size: '500 ml',
    unit: 'Bottle',
    images: [pureOilBottle]
  };

  const heroImage = selectedHeroSize === '200 ml'
    ? (niraPouch200ml || pureOilBottle)
    : selectedHeroSize === '1 Litre'
    ? (niraPure1LBottle || pureOilBottle)
    : (pureOilBottle || niraBottle500ml);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION - Rich Kerala Heritage Artisan Design with 100% Background Continuity */}
      <section className="relative bg-[#FAF7F0] dark:bg-[#0c140e] text-stone-900 dark:text-stone-100 border-b border-amber-900/10 dark:border-emerald-950/40 overflow-hidden">

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">

            {/* Left Column: Brand Identity Centered with Canva-style Tectonic & Drift Animations */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-4 sm:space-y-5 flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto">
              {/* Major Logo Presentation - Centered with Drift Motion */}
              <div className="w-full flex justify-center items-center py-1 sm:py-2">
                <div className="w-full max-w-[340px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[580px] transition-transform duration-300 hover:scale-[1.02] animate-drift-in">
                  <ElaOfficialLogo
                    variant="badge"
                    className="w-full h-auto object-contain object-center drop-shadow-[0_12px_28px_rgba(58,32,18,0.15)] mx-auto animate-drift-float"
                  />
                </div>
              </div>

              {/* Tectonic Shift Subtitle Lockup & Malayalam Script */}
              <div className="space-y-2.5 flex flex-col items-center justify-center text-center w-full overflow-hidden">
                {/* Tectonic Split Plates: Left line shifts right, right line shifts left */}
                <div className="flex items-center justify-center gap-3 w-full max-w-md mx-auto">
                  <span className="h-0.5 flex-1 bg-[#3A2012]/30 dark:bg-amber-400/30 animate-tectonic-left"></span>
                  <h2 className="font-subline text-sm sm:text-base md:text-lg lg:text-xl font-bold uppercase tracking-[0.3em] whitespace-nowrap animate-tectonic-expand animate-shimmer-title">
                    COCONUT OIL
                  </h2>
                  <span className="h-0.5 flex-1 bg-[#3A2012]/30 dark:bg-amber-400/30 animate-tectonic-right"></span>
                </div>

                {/* Opposing Tectonic Badges: Left badge slides from left, Right badge from right */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3A2012] text-amber-100 font-bold text-xs tracking-wide shadow-xs border border-amber-900/30 transition-transform duration-300 hover:scale-105 animate-tectonic-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>ശുദ്ധമായ വെളിച്ചെണ്ണ</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/10 dark:bg-emerald-950/60 border border-emerald-800/30 text-[#144D29] dark:text-emerald-300 text-xs font-bold tracking-wide transition-transform duration-300 hover:scale-105 animate-tectonic-right">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#144D29] dark:text-emerald-400" />
                    <span>100% Raw & Unfiltered</span>
                  </span>
                </div>

                {/* Text Drift: Smooth Gliding Text Motion */}
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium max-w-md mx-auto pt-1 leading-relaxed animate-drift-in">
                  Traditional cold expeller pressed from sun-dried Kerala copra. Clarified naturally by gentle gravity with zero chemicals or heat.
                </p>
              </div>

              {/* Action Buttons with Counter Tectonic Momentum */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 w-full">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-7 py-3 bg-[#144D29] hover:bg-[#0E381D] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center group animate-tectonic-left"
                >
                  <span>Shop 3 Packaging Sizes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-white/80 hover:bg-white dark:bg-stone-800/80 dark:hover:bg-stone-800 text-[#3A2012] dark:text-amber-100 border border-amber-900/20 dark:border-stone-700 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center group animate-tectonic-right"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Watch Extraction</span>
                </button>
              </div>

              {/* Clean Trust Pillars with Alternating Shift */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-5 border-t border-amber-900/15 dark:border-stone-800 text-[11px] sm:text-xs text-stone-800 dark:text-stone-200 font-semibold w-full max-w-md mx-auto justify-items-center">
                <div className="flex items-center justify-center gap-1.5 text-center transition-colors hover:text-[#144D29] animate-tectonic-left">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#144D29] dark:text-emerald-400 shrink-0" />
                  <span>Zero Filtration</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-center transition-colors hover:text-[#144D29] animate-drift-in">
                  <Droplets className="w-3.5 h-3.5 text-[#144D29] dark:text-emerald-400 shrink-0" />
                  <span>Cold Pressed</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-center transition-colors hover:text-[#144D29] animate-tectonic-right">
                  <Truck className="w-3.5 h-3.5 text-[#144D29] dark:text-emerald-400 shrink-0" />
                  <span>Free Shipping ₹499+</span>
                </div>
              </div>

            </div>

            {/* Right Column: Editorial Product Showcase Stage with Rotation Video */}
            <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center relative">
              <div className="relative w-full max-w-md xl:max-w-lg aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border border-amber-900/15 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 group">
                <video
                  src="/videos/nira-product-rotation.mp4"
                  poster={heroImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Top Badge Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-stone-950/70 backdrop-blur-md text-amber-200 text-[11px] font-bold tracking-wider uppercase border border-amber-400/20">
                    Kerala Copra Single-Origin
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider">
                    {selectedHeroSize}
                  </span>
                </div>

                {/* Bottom Scrim & Product Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent flex items-end p-5 sm:p-6 pointer-events-none">
                  <div className="text-white space-y-1.5 w-full">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                      <div className="flex text-amber-400">
                        {'★'.repeat(5)}
                      </div>
                      <span className="text-stone-200">4.94 / 5 (340+ Verified Reviews)</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Raw Cold-Pressed Coconut Oil
                    </h3>
                    <p className="text-xs text-stone-300 line-clamp-1">
                      100% Native Kerala Copra · Settled by Gravity · Zero Adulteration
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Zero Adulteration</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">No mineral oils or paraffin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">High Lauric Acid</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">50%+ immunity boosting MCTs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">FSSAI Certified</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">License #{settings.fssaiNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Free Shipping</h4>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">On all orders above ₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION — 3 PACKAGING SIZES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
              One Signature Oil • Three Sizes
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Choose Your Packaging Size
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              100% Unfiltered Pure Coconut Oil. Available in 200 ml, 500 ml, and 1 Litre bottles.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 flex items-center gap-1 group"
          >
            <span>Compare Sizes in Store</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-stone-100 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 3B. WHY UNFILTERED MEANS MORE NUTRIENTS — DEDICATED SPOTLIGHT (2-COLUMN) */}
      <section id="why-unfiltered" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#5C664D] text-white rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-white/20">
          {/* Background Image: Kerala Coconut Grove Sunrise & Backwaters - Highly Visible */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={keralaCoconutGrove}
              alt="Lush Kerala Coconut Grove Sunrise"
              className="w-full h-full object-cover object-center transform scale-105 opacity-100 filter saturate-110 brightness-95"
            />
            {/* Lighter, translucent gradient overlay matching the earthy green studio hue */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d4632]/85 via-[#4a543e]/50 to-[#5C664D]/60 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10">
            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* LEFT COLUMN: Video with Non-Blocking Wordings Above */}
              <div className="lg:col-span-5 flex flex-col items-start w-full">
                {/* Wordings above the video */}
                <div className="mb-4 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/75 backdrop-blur-md text-amber-300 text-xs uppercase font-bold tracking-widest border border-amber-400/40 mb-2 shadow-md">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    <span>Raw Clarification</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug drop-shadow-lg">
                    Natural Decantation in Action
                  </h3>
                  <p className="text-amber-100 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal drop-shadow-md">
                    Experience slow, unheated gravity settling — preserving living nutrients without aggressive micro-mesh or chemical processing.
                  </p>
                </div>

                {/* Video Player Frame */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/30 shadow-2xl bg-stone-950/70 group">
                  <video
                    ref={videoRef}
                    id="unfiltered-process-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full aspect-square sm:aspect-[4/3] lg:aspect-square object-cover"
                    key={customVideoSrc}
                  >
                    <source src={customVideoSrc} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>

                  {/* Change Video Button on Top-Right */}
                  <div className="absolute top-3 right-3 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => {
                        setTempVideoUrl(customVideoSrc);
                        setIsVideoModalOpen(true);
                      }}
                      className="bg-stone-950/90 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xl border border-amber-400/40 backdrop-blur-md transition-all cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Change Video</span>
                    </button>
                  </div>

                  {/* Corner indicator badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[11px] font-semibold tracking-wide text-amber-300 bg-stone-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30 shadow-md">
                      Pure Copra Extract
                    </span>
                    <span className="text-[11px] font-medium text-stone-200 bg-stone-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                      100% Unfiltered
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Scientific Purity & Nutrition Details */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-block px-4 py-1 rounded-full bg-stone-950/75 backdrop-blur-md text-amber-300 text-xs uppercase font-bold tracking-widest border border-amber-400/40 mb-3 shadow-lg">
                    Scientific Purity & Nutrition
                  </span>
                  
                  {/* Headline with Translucent Glass Container to reveal background */}
                  <div className="bg-stone-950/60 dark:bg-stone-950/70 backdrop-blur-md px-5 sm:px-6 py-4 rounded-2xl border border-white/20 shadow-xl">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
                      Why Without Filtration Means More Nutrients
                    </h2>
                    <p className="text-stone-100 text-xs sm:text-sm mt-2 leading-relaxed font-normal drop-shadow-sm">
                      Most commercial coconut oils pass through aggressive high-pressure micro-mesh filters, chemical adsorbents, or diatomaceous earth to achieve extreme artificial transparency. In doing so, they strip away nature’s most potent health compounds.
                    </p>
                  </div>
                </div>

                {/* 4 Cards Grid - Translucent Glassmorphism so background palm groves show through */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full text-left">
                  <div className="bg-stone-950/55 dark:bg-stone-950/65 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 hover:border-amber-400/80 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        1
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm drop-shadow-sm">Intact Vitamin E & Tocopherols</h3>
                    </div>
                    <p className="text-xs text-stone-100 leading-relaxed font-normal drop-shadow-xs">
                      Natural Vitamin E is a delicate lipid antioxidant. Unfiltered copra oil retains active tocopherols that protect skin cells from UV damage and deeply nourish hair follicles.
                    </p>
                  </div>

                  <div className="bg-stone-950/55 dark:bg-stone-950/65 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 hover:border-amber-400/80 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        2
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm drop-shadow-sm">Full-Spectrum Polyphenols</h3>
                    </div>
                    <p className="text-xs text-stone-100 leading-relaxed font-normal drop-shadow-xs">
                      Plant polyphenols act as powerful free-radical scavengers. Mechanical filtration separates these micronutrients out — our gentle gravity settling keeps every milligram inside.
                    </p>
                  </div>

                  <div className="bg-stone-950/55 dark:bg-stone-950/65 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 hover:border-amber-400/80 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        3
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm drop-shadow-sm">Bioactive Plant Sterols</h3>
                    </div>
                    <p className="text-xs text-stone-100 leading-relaxed font-normal drop-shadow-xs">
                      Naturally occurring phytosterols support cellular repair and healthy lipid profiles. Unfiltered oil preserves these vital building blocks in their native, unheated state.
                    </p>
                  </div>

                  <div className="bg-stone-950/55 dark:bg-stone-950/65 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/25 hover:border-amber-400/80 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        4
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm drop-shadow-sm">Authentic Roasted Aroma</h3>
                    </div>
                    <p className="text-xs text-stone-100 leading-relaxed font-normal drop-shadow-xs">
                      The intoxicating aroma of sun-dried Kerala copra comes from natural volatile aromatic ketones. Deodorizing and heavy filtering remove this signature nostalgic fragrance.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Guarantee & CTA Banner */}
            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-stone-950/55 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-xl">
              <div className="text-xs sm:text-sm text-amber-200 font-medium text-center sm:text-left drop-shadow-sm">
                ✨ Zero mechanical micro-filters. Natural gravity clarification only.
              </div>
              <Link
                to="/shop"
                className="w-full sm:w-auto text-center px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105"
              >
                Order Unfiltered Oil Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HERITAGE & ORIGIN STORY */}
      <section className="bg-stone-50 dark:bg-stone-900/60 py-12 sm:py-16 border-y border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
                The Heritage of Malabar
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
                From Kerala’s Sun-Soaked Palms Directly to Your Kitchen
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                For centuries, Kerala’s lush coastal climate and rich alluvial soil have produced coconuts renowned worldwide for their thick, sweet kernel and aromatic natural oil content.
              </p>
              <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
                At ELA naturals, we preserve this ancestral tradition. We refuse to use sulphur smoke to hasten copra drying, and we never subject our oil to high-temperature chemical deodorizing. The result is pure liquid gold — fragrant, healthy, and deeply flavorful.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-400">100%</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Natural Sun-Dried Copra</span>
                </div>
                <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-400">0%</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">Sulphur, Preservatives, or Bleach</span>
                </div>
              </div>
            </div>

            <div className="relative mt-4 lg:mt-0">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800 bg-stone-900">
                <img
                  src={niraKeralaCooking}
                  alt="Authentic Kerala Traditional Cooking with ELA naturals Pure Coconut Oil"
                  className="w-full h-auto block transform hover:scale-[1.01] transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-3 -left-2 sm:-bottom-5 sm:-left-4 lg:-bottom-6 lg:-left-6 bg-emerald-950/95 backdrop-blur-md text-white p-3.5 sm:p-5 rounded-2xl shadow-2xl max-w-[240px] sm:max-w-xs border border-emerald-500/40">
                <p className="font-serif text-xs sm:text-sm font-bold leading-snug">“Purity you can smell the moment you open the seal.”</p>
                <p className="text-[10px] sm:text-xs text-emerald-200 mt-1 font-medium">— Sreedharan P., Master Presser</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT IS MADE — 5-STEP VISUAL PROCESS */}
      <section id="how-it-is-made" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
            Purity Without Compromise
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            How ELA naturals Is Crafted
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-2">
            Every step is designed to safeguard the delicate fatty acids, vitamins, and mouthwatering natural aroma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            {
              step: '01',
              title: 'Selective Harvesting',
              desc: 'We pick fully mature coconuts from certified Malabar groves for peak kernel density.'
            },
            {
              step: '02',
              title: 'Natural Sun Drying',
              desc: 'Copra is sun-dried on clean platforms without harmful sulphur fumes or artificial heat.'
            },
            {
              step: '03',
              title: 'Cold Expeller Pressing',
              desc: 'Crushed mechanically at controlled low temperatures to keep vital nutrients intact.'
            },
            {
              step: '04',
              title: 'Natural Gravity Settling',
              desc: 'Settled naturally by gravity without mechanical micro-filters — keeping live Vitamin E, polyphenols, and plant sterols intact.'
            },
            {
              step: '05',
              title: 'Tamper-Evident Pack',
              desc: 'Sealed immediately in hygienic food-grade bottles (200ml, 500ml & 1L) to lock in raw freshness.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 relative flex flex-col justify-between hover:border-emerald-600 dark:hover:border-emerald-500 transition-colors group shadow-xs"
            >
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-300 dark:text-stone-700 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {item.step}
                </span>
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 mt-2 sm:mt-3">{item.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Lab Tested
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE ELA naturals — COMPARISON TABLE */}
      <section id="why-choose-us" className="bg-[#5C664D] text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
              Know What You Eat
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              ELA naturals vs. Commercial Refined Oils
            </h2>
            <p className="text-stone-100 text-xs sm:text-sm mt-2">
              See why hundreds of discerning families have permanently switched to authentic cold-pressed Kerala oil.
            </p>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[620px] bg-[#48523d] rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
              <div className="grid grid-cols-3 bg-[#3a4330] p-4 sm:p-6 text-xs sm:text-sm font-bold border-b border-white/15">
                <span className="text-stone-200">Quality Parameter</span>
                <span className="text-amber-300 font-serif text-xs sm:text-base">🥥 ELA naturals Pure Oil</span>
                <span className="text-stone-200">Cheap Commercial Brands</span>
              </div>

              <div className="divide-y divide-white/15 text-xs sm:text-sm">
                {[
                  {
                    param: 'Filtration & Purity',
                    nira: '100% Unfiltered (Zero filtration; keeps all nutrients)',
                    commercial: 'Micro-filtered & bleached (strips nutrients)'
                  },
                  {
                    param: 'Copra Drying',
                    nira: '100% Natural Sun-Dried Copra',
                    commercial: 'Sulphur-fumigated chemical drying'
                  },
                  {
                    param: 'Extraction Heat',
                    nira: 'Cold expeller pressed (<50°C)',
                    commercial: 'High-heat solvent extracted (>180°C)'
                  },
                  {
                    param: 'Chemical Refining',
                    nira: 'Zero bleach, zero deodorizers',
                    commercial: 'Bleached & chemically neutralized'
                  },
                  {
                    param: 'Vitamin E & Polyphenols',
                    nira: 'Intact live antioxidants preserved',
                    commercial: 'Destroyed during high heat & filtering'
                  },
                  {
                    param: 'Aroma & Taste',
                    nira: 'Authentic toasted coconut fragrance',
                    commercial: 'Odorless or artificial chemical smell'
                  },
                  {
                    param: 'Nutrient Retention',
                    nira: 'Max natural nutrients + 50% Lauric Acid',
                    commercial: 'Stripped of delicate micronutrients'
                  },
                  {
                    param: 'Packaging Formats',
                    nira: '200 ml, 500 ml & 1 Litre bottles',
                    commercial: 'Cheap plastic pouches'
                  }
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-3 p-3.5 sm:p-5 items-center gap-3">
                    <span className="font-medium text-stone-100 text-xs sm:text-sm">{row.param}</span>
                    <span className="text-emerald-200 font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
                      {row.nira}
                    </span>
                    <span className="text-stone-300 text-xs sm:text-sm">{row.commercial}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WELLNESS & CULINARY USE CASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-md">
                <img
                  src={keralaCooking}
                  alt="Kerala traditional cooking with pure coconut oil"
                  className="w-full h-44 sm:h-48 object-cover"
                />
                <div className="p-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Authentic Kerala Cooking</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">High smoke point tadka & curries</p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md">
                <img
                  src={childPureOil}
                  alt="Child baby massage with natural coconut oil"
                  className="w-full h-44 sm:h-48 object-cover"
                />
                <div className="p-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Baby & Hair Massage</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">Ayurvedic natural nourishment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5 sm:space-y-6">
            <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
              Versatile Daily Nourishment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
              One Pure Oil. Countless Everyday Rituals.
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  🍳
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Authentic Indian Culinary Magic</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Adds distinctive Malabar aroma to fish curries, avial, thoran, sambar, and crispy banana chips. Does not smoke or break down easily under high heat.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  💆‍♀️
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Hair Follicle & Scalp Revitalization</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Penetrates deep into the hair shaft, reducing protein loss and curbing frizz. Perfect for traditional Sunday hot oil head baths.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0">
                  👶
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">Hypoallergenic Baby Skin Care</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    Free from parabens, phthalates, and synthetic perfumes. Pediatrician-safe for newborn daily skin massage and dry patch relief.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FAQ Accordion Section */}
      <FaqAccordion />

      {/* Video Customization Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-stone-100 relative">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">Change Spotlight Video</h3>
                <p className="text-xs text-stone-400">Update the video shown in the "Why Without Filtration" section</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Video URL (Direct MP4 link or asset path)
                </label>
                <input
                  type="text"
                  value={tempVideoUrl}
                  onChange={(e) => setTempVideoUrl(e.target.value)}
                  placeholder="/images/your-video.mp4 or https://..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Or Upload Video File (.mp4)
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setTempVideoUrl(url);
                    }
                  }}
                  className="w-full text-xs text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 file:cursor-pointer cursor-pointer border border-stone-800 rounded-xl bg-stone-950 p-2"
                />
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-xs text-stone-400 space-y-1">
                <p className="font-medium text-stone-300">💡 How to change it permanently in code:</p>
                <p>1. Place your <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">.mp4</code> file in <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">public/videos/</code> or <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">public/images/</code>.</p>
                <p>2. Update <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">src/assets/images/index.ts</code> or update the <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">&lt;source&gt;</code> path in <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">src/pages/HomePage.tsx</code>.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempVideoUrl.trim()) {
                      setCustomVideoSrc(tempVideoUrl.trim());
                      setIsVideoModalOpen(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
                >
                  Apply Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
