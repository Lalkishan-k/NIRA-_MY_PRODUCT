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
import { ProductCard } from '../components/ProductCard';
import {
  heroCoconutOil,
  keralaCooking,
  niraKeralaCooking,
  keralaCoconutGrove,
  coconutHarvest,
  childPureOil,
  niraOilBottle,
  niraPure1LBottle,
  productRotationVideo,
  unfilteredVideo
} from '../assets/images';

export const HomePage: React.FC = () => {
  const { products, isLoadingProducts, settings } = useStore();
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

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION - Seamless Studio Atmosphere with Color Blending */}
      <section className="relative bg-[#5C664D] text-white border-b border-stone-700/40 overflow-hidden min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex items-center">
        {/* Unified Studio Wall Backdrop covering the entire section */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Base Tone matching the authentic studio wall */}
          <div className="absolute inset-0 bg-[#5C664D]" />

          {/* Seamless Studio Backdrop directly sampled and texture-matched to the video's studio canvas */}
          <img
            src="/images/studio-backdrop-seamless.jpg?v=2"
            alt=""
            className="w-full h-full object-cover object-bottom pointer-events-none select-none"
          />
        </div>

        {/* Video element positioned at the right side with zero letterboxing / zero right seam */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div 
            onClick={toggleVideo}
            className="absolute right-0 top-0 bottom-0 h-full w-full sm:w-auto sm:aspect-square max-w-full flex justify-end items-end cursor-pointer pointer-events-auto"
            title="Click to play or pause product rotation"
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-right select-none"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.75) 40%, black 52%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 12%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.75) 40%, black 52%)',
              }}
            >
              <source src={productRotationVideo} type="video/mp4" />
              <source src="/videos/nira-product-rotation.mp4" type="video/mp4" />
              <source src="/videos/create-a-smooth-realistic-product-rotation (4).mp4" type="video/mp4" />
              <source src="/videos/create-a-smooth-realistic-product-rotation (3).mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Unified Studio Atmosphere & Balanced Lighting across BOTH sides */}
        <div className="absolute inset-0 z-[5] pointer-events-none select-none">
          {/* Subtle balanced warm studio ambient glow across the whole scene */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(230,210,160,0.06)_0%,transparent_70%)]" />
          {/* Subtle framing at very top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/8 via-transparent to-black/10" />
        </div>

        {/* Floating 360° Indicator & Play/Pause Controller */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-20 flex items-center gap-2">
          <div className="bg-stone-900/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg select-none">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>360° View</span>
          </div>
          <button
            onClick={toggleVideo}
            type="button"
            aria-label={isVideoPlaying ? 'Pause rotation video' : 'Play rotation video'}
            className="w-8 h-8 rounded-full bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-colors shadow-lg"
          >
            {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
          </button>
        </div>

        {/* Hero Content on the left side */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 xl:col-span-6 space-y-6 max-w-xl pl-4 sm:pl-8 md:pl-10 lg:pl-12 xl:pl-16">
              {/* Refined natural badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/25 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="tracking-wide">100% Raw & Unfiltered Kerala Copra</span>
              </div>

              {/* Title & Subtitle styled with the brand identity font */}
              <div className="space-y-4">
                <div className="flex flex-col items-start">
                  <h1 className="font-brand text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.92] drop-shadow-md">
                    NIRA
                  </h1>
                  <div className="flex items-center gap-3 pt-2 pb-1">
                    <span className="h-0.5 w-6 sm:w-12 bg-[#D9CEBA]/60"></span>
                    <span className="font-subline text-sm sm:text-lg md:text-xl font-bold uppercase tracking-[0.25em] text-[#F4EFE6] drop-shadow-xs">
                      COCONUT OIL
                    </span>
                    <span className="h-0.5 w-6 sm:w-12 bg-[#D9CEBA]/60"></span>
                  </div>
                </div>
                <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-[#EFE7D8] font-normal tracking-tight">
                  Naturally Better. Zero Filtration.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#144D29] rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-center"
                >
                  <span>Shop 3 Packaging Sizes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#why-unfiltered"
                  className="w-full sm:w-auto px-7 py-3.5 bg-black/25 hover:bg-black/40 text-white border border-white/30 rounded-full font-semibold text-sm transition-colors shadow-2xs text-center backdrop-blur-xs"
                >
                  Why Unfiltered = More Nutrients
                </a>
              </div>

              {/* Quick trust metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-white/20 text-xs text-stone-100 font-medium max-w-xl">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Zero Filtration (100% Nutrients)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Cold Expeller Pressed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>200ml, 500ml & 1L Packs</span>
                </div>
              </div>
            </div>

            {/* Clickable open area on the right showcasing the background bottle rotation */}
            <div 
              onClick={toggleVideo}
              className="hidden lg:block lg:col-span-5 xl:col-span-6 h-[460px] xl:h-[520px] cursor-pointer"
              title="Click to play or pause product rotation"
            />
          </div>
        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Zero Adulteration</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">No mineral oils or paraffin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">High Lauric Acid</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">50%+ immunity boosting MCTs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">FSSAI Certified</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">License #{settings.fssaiNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Free Shipping</h4>
              <p className="text-[11px] sm:text-xs text-stone-500">On all orders above ₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION — 3 PACKAGING SIZES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
              One Signature Oil • Three Sizes
            </span>
            <h2 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Choose Your Packaging Size
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              100% Unfiltered Pure Coconut Oil. Available in 200 ml, 500 ml, and 1 Litre bottles.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
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
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden shadow-2xl border border-stone-700/50">
          {/* Background Image: Kerala Coconut Grove Sunrise & Backwaters */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={keralaCoconutGrove}
              alt="Lush Kerala Coconut Grove Sunrise"
              className="w-full h-full object-cover object-center transform scale-100 opacity-90 filter saturate-105"
            />
            {/* Subtle Vignette & Gradient for High Contrast & Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/70 to-stone-950/80" />
          </div>

          <div className="relative z-10">
            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* LEFT COLUMN: Video with Non-Blocking Wordings Above */}
              <div className="lg:col-span-5 flex flex-col items-start w-full">
                {/* Wordings above the video (cleanly placed above without blocking the video view) */}
                <div className="mb-4 w-full">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 text-xs uppercase font-bold tracking-widest border border-amber-400/40 mb-2 shadow-md">
                    <Droplets className="w-3.5 h-3.5 text-amber-400" />
                    <span>Raw Clarification</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug drop-shadow-md">
                    Natural Decantation in Action
                  </h3>
                  <p className="text-amber-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
                    Experience slow, unheated gravity settling — preserving living nutrients without aggressive micro-mesh or chemical processing.
                  </p>
                </div>

                {/* Video Player Frame */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-stone-950/90 group">
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
                      className="bg-stone-950/90 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xl border border-amber-400/40 backdrop-blur-md transition-all"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Change Video</span>
                    </button>
                  </div>

                  {/* Corner indicator badges (non-blocking, positioned at base edges) */}
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
                  <span className="inline-block px-4 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 text-xs uppercase font-bold tracking-widest border border-amber-400/40 mb-3 shadow-lg">
                    Scientific Purity & Nutrition
                  </span>
                  
                  {/* Headline with High Contrast Background Container */}
                  <div className="bg-stone-950/75 backdrop-blur-md px-5 sm:px-6 py-4 rounded-2xl border border-white/15 shadow-xl">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                      Why Without Filtration Means More Nutrients
                    </h2>
                    <p className="text-amber-100 text-xs sm:text-sm mt-2 leading-relaxed font-normal">
                      Most commercial coconut oils pass through aggressive high-pressure micro-mesh filters, chemical adsorbents, or diatomaceous earth to achieve extreme artificial transparency. In doing so, they strip away nature’s most potent health compounds.
                    </p>
                  </div>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full text-left">
                  <div className="bg-stone-950/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        1
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm">Intact Vitamin E & Tocopherols</h3>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed font-normal">
                      Natural Vitamin E is a delicate lipid antioxidant. Unfiltered copra oil retains active tocopherols that protect skin cells from UV damage and deeply nourish hair follicles.
                    </p>
                  </div>

                  <div className="bg-stone-950/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        2
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm">Full-Spectrum Polyphenols</h3>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed font-normal">
                      Plant polyphenols act as powerful free-radical scavengers. Mechanical filtration separates these micronutrients out — our gentle gravity settling keeps every milligram inside.
                    </p>
                  </div>

                  <div className="bg-stone-950/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        3
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm">Bioactive Plant Sterols</h3>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed font-normal">
                      Naturally occurring phytosterols support cellular repair and healthy lipid profiles. Unfiltered oil preserves these vital building blocks in their native, unheated state.
                    </p>
                  </div>

                  <div className="bg-stone-950/80 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-xl">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        4
                      </div>
                      <h3 className="font-serif font-bold text-white text-sm">Authentic Roasted Aroma</h3>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed font-normal">
                      The intoxicating aroma of sun-dried Kerala copra comes from natural volatile aromatic ketones. Deodorizing and heavy filtering remove this signature nostalgic fragrance.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Guarantee & CTA Banner */}
            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-stone-950/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-xl">
              <div className="text-xs sm:text-sm text-amber-200 font-medium text-center sm:text-left">
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
      <section className="bg-stone-50 py-12 sm:py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
                The Heritage of Malabar
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-snug">
                From Kerala’s Sun-Soaked Palms Directly to Your Kitchen
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                For centuries, Kerala’s lush coastal climate and rich alluvial soil have produced coconuts renowned worldwide for their thick, sweet kernel and aromatic natural oil content.
              </p>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                At NIRA, we preserve this ancestral tradition. We refuse to use sulphur smoke to hasten copra drying, and we never subject our oil to high-temperature chemical deodorizing. The result is pure liquid gold — fragrant, healthy, and deeply flavorful.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-emerald-900">100%</span>
                  <span className="text-xs text-stone-500">Natural Sun-Dried Copra</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <span className="block font-serif text-xl sm:text-2xl font-bold text-emerald-900">0%</span>
                  <span className="text-xs text-stone-500">Sulphur, Preservatives, or Bleach</span>
                </div>
              </div>
            </div>

            <div className="relative mt-4 lg:mt-0">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
                <img
                  src={niraKeralaCooking}
                  alt="Authentic Kerala Traditional Cooking with NIRA Pure Coconut Oil"
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
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
            Purity Without Compromise
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            How NIRA Is Crafted
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-2">
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
              className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 relative flex flex-col justify-between hover:border-emerald-600 transition-colors group"
            >
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-300 group-hover:text-emerald-800 transition-colors">
                  {item.step}
                </span>
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 mt-2 sm:mt-3">{item.title}</h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Lab Tested
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE NIRA — COMPARISON TABLE */}
      <section id="why-choose-us" className="bg-stone-900 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Know What You Eat
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
              NIRA vs. Commercial Refined Oils
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-2">
              See why hundreds of discerning families have permanently switched to authentic cold-pressed Kerala oil.
            </p>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[620px] bg-stone-800 rounded-3xl overflow-hidden border border-stone-700 shadow-2xl">
              <div className="grid grid-cols-3 bg-stone-950 p-4 sm:p-6 text-xs sm:text-sm font-bold border-b border-stone-700">
                <span className="text-stone-400">Quality Parameter</span>
                <span className="text-emerald-400 font-serif text-xs sm:text-base">🥥 NIRA Pure Oil</span>
                <span className="text-stone-400">Cheap Commercial Brands</span>
              </div>

              <div className="divide-y divide-stone-700/60 text-xs sm:text-sm">
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
                    <span className="font-medium text-stone-300 text-xs sm:text-sm">{row.param}</span>
                    <span className="text-emerald-300 font-semibold flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                      {row.nira}
                    </span>
                    <span className="text-stone-400 text-xs sm:text-sm">{row.commercial}</span>
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
                <div className="p-3 bg-stone-50 border-t border-stone-200">
                  <p className="text-xs font-bold text-stone-800">Authentic Kerala Cooking</p>
                  <p className="text-[11px] text-stone-500">High smoke point tadka & curries</p>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md">
                <img
                  src={childPureOil}
                  alt="Child baby massage with natural coconut oil"
                  className="w-full h-44 sm:h-48 object-cover"
                />
                <div className="p-3 bg-stone-50 border-t border-stone-200">
                  <p className="text-xs font-bold text-stone-800">Baby & Hair Massage</p>
                  <p className="text-[11px] text-stone-500">Ayurvedic natural nourishment</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5 sm:space-y-6">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold">
              Versatile Daily Nourishment
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              One Pure Oil. Countless Everyday Rituals.
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                  🍳
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">Authentic Indian Culinary Magic</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-relaxed">
                    Adds distinctive Malabar aroma to fish curries, avial, thoran, sambar, and crispy banana chips. Does not smoke or break down easily under high heat.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  💆‍♀️
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">Hair Follicle & Scalp Revitalization</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-relaxed">
                    Penetrates deep into the hair shaft, reducing protein loss and curbing frizz. Perfect for traditional Sunday hot oil head baths.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                  👶
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900">Hypoallergenic Baby Skin Care</h4>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-1 leading-relaxed">
                    Free from parabens, phthalates, and synthetic perfumes. Pediatrician-safe for newborn daily skin massage and dry patch relief.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



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
