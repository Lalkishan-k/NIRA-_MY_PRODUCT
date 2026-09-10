import React from 'react';
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
  Star
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
  niraOilBottle
} from '../assets/images';

export const HomePage: React.FC = () => {
  const { products, isLoadingProducts, settings } = useStore();

  const featuredProducts = products.filter(p => p.featured && p.active).slice(0, 4);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-[#FAF7F2] via-[#F6F2EA] to-[#EFE7DC] text-stone-900 border-b border-stone-200/80 overflow-hidden">
        {/* Background Image with carefully balanced overlay for visibility and text priority */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={keralaCoconutGrove}
            alt="Authentic Kerala Coconut Grove Sunrise Landscape"
            className="w-full h-full object-cover object-center opacity-40 lg:opacity-45 scale-105 filter saturate-110"
          />
          {/* Subtle gradient wash to ensure highest priority & contrast for foreground text and card */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/90 via-[#FAF7F2]/75 to-[#FAF7F2]/45 sm:from-[#FAF7F2]/85 sm:via-[#FAF7F2]/70 sm:to-[#FAF7F2]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#EFE7DC]/90 via-transparent to-transparent" />
        </div>

        {/* Soft atmospheric ambient glow */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 pl-2 sm:pl-6 lg:pl-10 xl:pl-14">
              {/* Refined natural badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/70 text-emerald-900 text-xs font-semibold backdrop-blur-xs shadow-2xs">
                <Leaf className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="tracking-wide">100% Raw & Unfiltered Kerala Copra</span>
              </div>

              {/* Title & Subtitle styled with the brand identity font */}
              <div className="space-y-4">
                <div className="flex flex-col items-start">
                  <h1 className="font-brand text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#144D29] tracking-tight leading-[0.92] drop-shadow-xs">
                    NIRA
                  </h1>
                  <div className="flex items-center gap-3 pt-2 pb-1">
                    <span className="h-0.5 w-6 sm:w-12 bg-[#3C2214]/50"></span>
                    <span className="font-subline text-sm sm:text-lg md:text-xl font-bold uppercase tracking-[0.25em] text-[#3C2214]">
                      COCONUT OIL
                    </span>
                    <span className="h-0.5 w-6 sm:w-12 bg-[#3C2214]/50"></span>
                  </div>
                </div>
                <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-emerald-900/90 font-normal tracking-tight">
                  Naturally Better. Zero Filtration.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-emerald-900/20 flex items-center justify-center gap-2 text-center"
                >
                  <span>Shop 3 Packaging Sizes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#why-unfiltered"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300/80 rounded-full font-semibold text-sm transition-colors shadow-2xs text-center"
                >
                  Why Unfiltered = More Nutrients
                </a>
              </div>

              {/* Quick trust metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-stone-300/70 text-xs text-stone-700 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Zero Filtration (100% Nutrients)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Cold Expeller Pressed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>200ml, 500ml & 1L Packs</span>
                </div>
              </div>
            </div>

            {/* Showcase Card featuring NIRA product image */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-sm sm:max-w-md w-full">
                <div className="rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xl bg-white group ring-1 ring-stone-950/5">
                  <img
                    src={niraOilBottle}
                    alt="NIRA Coconut Oil Bottle with Coconuts"
                    className="w-full aspect-square object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4 sm:p-5 bg-white border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold">100% Pure & Unfiltered</p>
                      <p className="font-serif text-base font-bold text-stone-900">NIRA Coconut Oil</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Zero Filtration
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 bg-white text-stone-900 px-4 py-2.5 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-2 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Live Bioactive Nutrients Preserved</span>
                </div>
              </div>
            </div>
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

      {/* 3B. WHY UNFILTERED MEANS MORE NUTRIENTS — DEDICATED SPOTLIGHT */}
      <section id="why-unfiltered" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-10 lg:p-16 relative overflow-hidden shadow-2xl border border-stone-700/50">
          {/* Background Image: Kerala Coconut Grove Sunrise & Backwaters */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={keralaCoconutGrove}
              alt="Lush Kerala Coconut Grove Sunrise"
              className="w-full h-full object-cover object-center transform scale-100 opacity-90 filter saturate-105"
            />
            {/* Subtle Vignette & Gradient for High Contrast & Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-stone-950/75" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md text-amber-300 text-xs uppercase font-bold tracking-widest border border-amber-400/40 mb-4 shadow-lg">
              Scientific Purity & Nutrition
            </span>
            
            {/* Headline with High Contrast Background Container */}
            <div className="bg-stone-950/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 shadow-xl max-w-3xl mb-2">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight drop-shadow-md">
                Why Without Filtration Means More Nutrients
              </h2>
              <p className="text-amber-100 text-xs sm:text-sm lg:text-base mt-2.5 leading-relaxed font-normal">
                Most commercial coconut oils pass through aggressive high-pressure micro-mesh filters, chemical adsorbents, or diatomaceous earth to achieve extreme artificial transparency. In doing so, they strip away nature’s most potent health compounds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full text-left">
              <div className="bg-stone-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                    1
                  </div>
                  <h3 className="font-serif font-bold text-white text-sm sm:text-base">Intact Vitamin E & Tocopherols</h3>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed font-normal">
                  Natural Vitamin E is a delicate lipid antioxidant. Unfiltered copra oil retains active tocopherols that protect skin cells from UV damage and deeply nourish hair follicles.
                </p>
              </div>

              <div className="bg-stone-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                    2
                  </div>
                  <h3 className="font-serif font-bold text-white text-sm sm:text-base">Full-Spectrum Polyphenols</h3>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed font-normal">
                  Plant polyphenols act as powerful free-radical scavengers. Mechanical filtration separates these micronutrients out — our gentle gravity settling keeps every milligram inside.
                </p>
              </div>

              <div className="bg-stone-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                    3
                  </div>
                  <h3 className="font-serif font-bold text-white text-sm sm:text-base">Bioactive Plant Sterols</h3>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed font-normal">
                  Naturally occurring phytosterols support cellular repair and healthy lipid profiles. Unfiltered oil preserves these vital building blocks in their native, unheated state.
                </p>
              </div>

              <div className="bg-stone-950/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 hover:border-amber-400/70 transition-all shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                    4
                  </div>
                  <h3 className="font-serif font-bold text-white text-sm sm:text-base">Authentic Roasted Aroma</h3>
                </div>
                <p className="text-xs text-stone-200 leading-relaxed font-normal">
                  The intoxicating aroma of sun-dried Kerala copra comes from natural volatile aromatic ketones. Deodorizing and heavy filtering remove this signature nostalgic fragrance.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-stone-950/70 backdrop-blur-md px-6 py-4 rounded-2xl border">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 8. DISCOUNT CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-amber-300 font-mono text-xs uppercase tracking-widest font-bold">
              Special Welcome Discount
            </span>
            <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold">
              Enjoy 10% OFF on Your First Pure Batch
            </h3>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-lg">
              Use promo code <span className="font-mono font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">PURE10</span> during checkout on orders above ₹350.
            </p>
          </div>
          <Link
            to="/shop"
            className="w-full sm:w-auto text-center px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-full font-bold text-sm transition-colors shrink-0 shadow-md"
          >
            Apply & Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};
