import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Sparkles,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Droplets,
  Flame,
  Package
} from 'lucide-react';
import { ProductSize, Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  SIZE_NUTRIENT_DATA,
  getPackageTotalNutrients,
  BASE_100ML_MACROS,
  BASE_100ML_MICROS
} from '../data/nutrientData';

interface CompareSectionProps {
  initialSizeA?: ProductSize;
  initialSizeB?: ProductSize;
  title?: string;
  subtitle?: string;
}

export const CompareSection: React.FC<CompareSectionProps> = ({
  initialSizeA = '200 ml',
  initialSizeB = '500 ml',
  title = 'Side-by-Side Size & Nutrient Comparison',
  subtitle = 'Compare the exact nutrient yields, active MCTs, antioxidant concentrations, and pricing across our 3 authentic packaging sizes.'
}) => {
  const { products } = useStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [sizeA, setSizeA] = useState<ProductSize>(initialSizeA);
  const [sizeB, setSizeB] = useState<ProductSize>(initialSizeB);
  const [viewMode, setViewMode] = useState<'per100ml' | 'perPackage'>('perPackage');

  const sizeOptions: ProductSize[] = ['200 ml', '500 ml', '1 Litre'];

  const productA = useMemo(() => products.find(p => p.size === sizeA), [products, sizeA]);
  const productB = useMemo(() => products.find(p => p.size === sizeB), [products, sizeB]);

  const dataA = useMemo(() => SIZE_NUTRIENT_DATA[sizeA] || SIZE_NUTRIENT_DATA['200 ml'], [sizeA]);
  const dataB = useMemo(() => SIZE_NUTRIENT_DATA[sizeB] || SIZE_NUTRIENT_DATA['500 ml'], [sizeB]);

  const packNutrientsA = useMemo(() => getPackageTotalNutrients(sizeA), [sizeA]);
  const packNutrientsB = useMemo(() => getPackageTotalNutrients(sizeB), [sizeB]);

  const handleSwap = () => {
    const temp = sizeA;
    setSizeA(sizeB);
    setSizeB(temp);
  };

  const priceA = productA ? productA.price : dataA.basePrice;
  const priceB = productB ? productB.price : dataB.basePrice;

  const pricePer100mlA = Number(((priceA / dataA.volumeMl) * 100).toFixed(2));
  const pricePer100mlB = Number(((priceB / dataB.volumeMl) * 100).toFixed(2));

  const isBMoreEconomical = pricePer100mlB < pricePer100mlA;
  const isAMoreEconomical = pricePer100mlA < pricePer100mlB;

  const savingsPercent = isBMoreEconomical
    ? Math.round(((pricePer100mlA - pricePer100mlB) / pricePer100mlA) * 100)
    : isAMoreEconomical
    ? Math.round(((pricePer100mlB - pricePer100mlA) / pricePer100mlB) * 100)
    : 0;

  const handleAddProduct = (prod?: Product) => {
    if (prod) addToCart(prod, 1);
  };

  const handleBuyProduct = (prod?: Product) => {
    if (prod) {
      addToCart(prod, 1);
      navigate('/checkout');
    }
  };

  return (
    <section id="compare-sizes" className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-stone-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
            <Droplets className="w-3.5 h-3.5" />
            Nutrient Profile Comparator
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">{subtitle}</p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex bg-stone-800 p-1 rounded-2xl border border-stone-700 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('perPackage')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'perPackage'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Container Total Yield
          </button>
          <button
            type="button"
            onClick={() => setViewMode('per100ml')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'per100ml'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            100 ml Baseline
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector A */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Select Size 1:
          </span>
          <div className="flex gap-1.5">
            {sizeOptions.map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  if (sz === sizeB) handleSwap();
                  else setSizeA(sz);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sizeA === sz
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Selector B */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
            Select Size 2:
          </span>
          <div className="flex items-center gap-1.5">
            {sizeOptions.map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => {
                  if (sz === sizeA) handleSwap();
                  else setSizeB(sz);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  sizeB === sz
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {sz}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Column Order"
              className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Body Table */}
      <div className="p-4 sm:p-8 space-y-8">
        {/* Product Cards Header */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8">
          {/* Card A */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200">
                  {sizeA}
                </span>
                {isAMoreEconomical && savingsPercent > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Save {savingsPercent}% / ml
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {productA && productA.images && (
                  <img
                    src={productA.images[0]}
                    alt={productA.name}
                    className="w-14 h-14 sm:w-18 sm:h-18 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                    {productA?.name || `NIRA Coconut Oil (${sizeA})`}
                  </h3>
                  <p className="text-[11px] text-stone-500">{dataA.containerType}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-stone-900 font-serif">₹{priceA}</span>
                <span className="text-xs text-stone-500 font-medium">
                  (₹{pricePer100mlA.toFixed(1)} / 100ml)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => handleAddProduct(productA)}
                className="py-2 px-2.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                type="button"
                onClick={() => handleBuyProduct(productA)}
                className="py-2 px-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Buy</span>
              </button>
            </div>
          </div>

          {/* Card B */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-800 border border-stone-200">
                  {sizeB}
                </span>
                {isBMoreEconomical && savingsPercent > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Save {savingsPercent}% / ml
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {productB && productB.images && (
                  <img
                    src={productB.images[0]}
                    alt={productB.name}
                    className="w-14 h-14 sm:w-18 sm:h-18 object-cover rounded-xl border border-stone-200 shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                    {productB?.name || `NIRA Coconut Oil (${sizeB})`}
                  </h3>
                  <p className="text-[11px] text-stone-500">{dataB.containerType}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-stone-900 font-serif">₹{priceB}</span>
                <span className="text-xs text-stone-500 font-medium">
                  (₹{pricePer100mlB.toFixed(1)} / 100ml)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => handleAddProduct(productB)}
                className="py-2 px-2.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
              <button
                type="button"
                onClick={() => handleBuyProduct(productB)}
                className="py-2 px-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Buy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional & Macro Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Energy, Fats & Lauric Acid MCT Breakdown</span>
            </h4>
            <span className="text-xs font-semibold text-stone-500">
              {viewMode === 'perPackage' ? 'Full Container Yield' : '100ml Standard'}
            </span>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs">
            {/* Energy */}
            <div className="grid grid-cols-12 bg-stone-50/70 p-3 items-center font-medium">
              <div className="col-span-6 text-stone-800 font-semibold">Energy (Caloric Value)</div>
              <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsA.macros.energyKcal} kcal` : `${BASE_100ML_MACROS.energyKcal} kcal`}
              </div>
              <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsB.macros.energyKcal} kcal` : `${BASE_100ML_MACROS.energyKcal} kcal`}
              </div>
            </div>

            {/* Total Fat */}
            <div className="grid grid-cols-12 p-3 items-center">
              <div className="col-span-6 text-stone-700">Total Fat Content</div>
              <div className="col-span-3 text-stone-800 text-center sm:text-left font-semibold">
                {viewMode === 'perPackage' ? `${packNutrientsA.macros.totalFatG} g` : `${BASE_100ML_MACROS.totalFatG} g`}
              </div>
              <div className="col-span-3 text-stone-800 text-center sm:text-left font-semibold">
                {viewMode === 'perPackage' ? `${packNutrientsB.macros.totalFatG} g` : `${BASE_100ML_MACROS.totalFatG} g`}
              </div>
            </div>

            {/* Lauric Acid Highlight */}
            <div className="grid grid-cols-12 bg-emerald-50/60 p-3 items-center">
              <div className="col-span-6 text-emerald-950 font-bold pl-2 border-l-2 border-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span>Lauric Acid (C12 Medium Chain)</span>
                  <span className="block text-[10px] font-normal text-emerald-800">51.8% native active immunity</span>
                </div>
              </div>
              <div className="col-span-3 font-extrabold text-emerald-900 text-center sm:text-left text-sm">
                {viewMode === 'perPackage' ? `${packNutrientsA.macros.lauricAcidG} g` : `${BASE_100ML_MACROS.lauricAcidG} g`}
              </div>
              <div className="col-span-3 font-extrabold text-emerald-900 text-center sm:text-left text-sm">
                {viewMode === 'perPackage' ? `${packNutrientsB.macros.lauricAcidG} g` : `${BASE_100ML_MACROS.lauricAcidG} g`}
              </div>
            </div>

            {/* Caprylic & Capric */}
            <div className="grid grid-cols-12 bg-amber-50/50 p-3 items-center">
              <div className="col-span-6 text-stone-800 font-semibold pl-2 border-l-2 border-amber-500">
                <div>Caprylic & Capric MCTs (C8+C10)</div>
                <div className="text-[10px] text-stone-500 font-normal">Ketogenic cellular energy</div>
              </div>
              <div className="col-span-3 font-bold text-amber-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsA.macros.caprylicCapricMctG} g` : `${BASE_100ML_MACROS.caprylicCapricMctG} g`}
              </div>
              <div className="col-span-3 font-bold text-amber-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsB.macros.caprylicCapricMctG} g` : `${BASE_100ML_MACROS.caprylicCapricMctG} g`}
              </div>
            </div>

            {/* Vitamin E */}
            <div className="grid grid-cols-12 p-3 items-center">
              <div className="col-span-6 text-stone-800 font-semibold">
                <div>Natural Tocopherols (Vitamin E)</div>
                <div className="text-[10px] text-stone-500 font-normal">Preserved by zero filtration</div>
              </div>
              <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsA.micros.vitaminEMg} mg` : `${BASE_100ML_MICROS.vitaminEMg} mg`}
              </div>
              <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsB.micros.vitaminEMg} mg` : `${BASE_100ML_MICROS.vitaminEMg} mg`}
              </div>
            </div>

            {/* Total Polyphenols */}
            <div className="grid grid-cols-12 bg-stone-50/40 p-3 items-center">
              <div className="col-span-6 text-stone-700">Total Active Polyphenols</div>
              <div className="col-span-3 text-stone-800 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsA.micros.polyphenolsMgGae} mg GAE` : `${BASE_100ML_MICROS.polyphenolsMgGae} mg GAE`}
              </div>
              <div className="col-span-3 text-stone-800 text-center sm:text-left">
                {viewMode === 'perPackage' ? `${packNutrientsB.micros.polyphenolsMgGae} mg GAE` : `${BASE_100ML_MICROS.polyphenolsMgGae} mg GAE`}
              </div>
            </div>

            {/* Trans Fat & Cholesterol */}
            <div className="grid grid-cols-12 p-3 items-center">
              <div className="col-span-6 text-stone-700">Trans Fats & Cholesterol</div>
              <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">0g / 0mg (Zero)</div>
              <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">0g / 0mg (Zero)</div>
            </div>
          </div>
        </div>

        {/* Practical Application & Packaging Guide */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-800" />
            <span>Usage Recommendations & Container Suitability</span>
          </h4>

          <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs">
            <div className="grid grid-cols-12 p-3 bg-stone-50/70 items-start">
              <div className="col-span-4 text-stone-800 font-bold">Ideal Everyday Use</div>
              <div className="col-span-4 text-stone-700 pr-2 leading-relaxed">{dataA.recommendedUse}</div>
              <div className="col-span-4 text-stone-700 pl-2 leading-relaxed">{dataB.recommendedUse}</div>
            </div>

            <div className="grid grid-cols-12 p-3 items-start">
              <div className="col-span-4 text-stone-800 font-bold">Recommended Routine</div>
              <div className="col-span-4 text-stone-600 pr-2">{dataA.bestSuitedAudience}</div>
              <div className="col-span-4 text-stone-600 pl-2">{dataB.bestSuitedAudience}</div>
            </div>

            <div className="grid grid-cols-12 p-3 bg-stone-50/70 items-start">
              <div className="col-span-4 text-stone-800 font-bold">Packaging Format</div>
              <div className="col-span-4 text-stone-600 pr-2">{dataA.packagingMaterial}</div>
              <div className="col-span-4 text-stone-600 pl-2">{dataB.packagingMaterial}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
