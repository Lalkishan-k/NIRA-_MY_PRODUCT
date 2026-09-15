import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowLeftRight,
  Sparkles,
  ShoppingBag,
  Zap,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  Droplets,
  Flame,
  Package,
  Info
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

interface CompareModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialSizeA?: ProductSize;
  initialSizeB?: ProductSize;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialSizeA,
  initialSizeB
}) => {
  const { isCompareOpen, closeCompare, compareSizes, setCompareSizes, products } = useStore();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCompareOpen;
  const handleClose = propOnClose || closeCompare;

  const [sizeA, setSizeA] = useState<ProductSize>(initialSizeA || compareSizes[0] || '200 ml');
  const [sizeB, setSizeB] = useState<ProductSize>(initialSizeB || compareSizes[1] || '500 ml');
  const [viewMode, setViewMode] = useState<'per100ml' | 'perPackage'>('perPackage');

  // Sync state if modal opens with different context sizes
  React.useEffect(() => {
    if (compareSizes && compareSizes.length === 2) {
      setSizeA(compareSizes[0]);
      setSizeB(compareSizes[1]);
    }
  }, [compareSizes]);

  const sizeOptions: ProductSize[] = ['200 ml', '500 ml', '1 Litre'];

  const productA = useMemo(() => products.find(p => p.size === sizeA), [products, sizeA]);
  const productB = useMemo(() => products.find(p => p.size === sizeB), [products, sizeB]);

  const dataA = useMemo(() => SIZE_NUTRIENT_DATA[sizeA] || SIZE_NUTRIENT_DATA['200 ml'], [sizeA]);
  const dataB = useMemo(() => SIZE_NUTRIENT_DATA[sizeB] || SIZE_NUTRIENT_DATA['500 ml'], [sizeB]);

  const packNutrientsA = useMemo(() => getPackageTotalNutrients(sizeA), [sizeA]);
  const packNutrientsB = useMemo(() => getPackageTotalNutrients(sizeB), [sizeB]);

  if (!isOpen) return null;

  const handleSwap = () => {
    const temp = sizeA;
    setSizeA(sizeB);
    setSizeB(temp);
    setCompareSizes([sizeB, temp]);
  };

  const handleSelectSizeA = (s: ProductSize) => {
    if (s === sizeB) {
      // If picking same size, swap or pick complementary
      handleSwap();
      return;
    }
    setSizeA(s);
    setCompareSizes([s, sizeB]);
  };

  const handleSelectSizeB = (s: ProductSize) => {
    if (s === sizeA) {
      handleSwap();
      return;
    }
    setSizeB(s);
    setCompareSizes([sizeA, s]);
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
    if (prod) {
      addToCart(prod, 1);
    }
  };

  const handleBuyProduct = (prod?: Product) => {
    if (prod) {
      addToCart(prod, 1);
      handleClose();
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight flex items-center gap-2">
                <span>Compare Packaging Sizes & Nutrients</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500">
                100% Raw Unfiltered Kerala Coconut Oil • Side-by-Side Analysis
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Size Selectors, Presets, and Mode Toggle */}
        <div className="p-4 sm:px-6 bg-white border-b border-stone-100 space-y-3.5">
          {/* Quick Presets & Swap */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="font-bold text-stone-500 hidden sm:inline">Compare Pairs:</span>
              <button
                type="button"
                onClick={() => {
                  setSizeA('200 ml');
                  setSizeB('500 ml');
                  setCompareSizes(['200 ml', '500 ml']);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  (sizeA === '200 ml' && sizeB === '500 ml') || (sizeA === '500 ml' && sizeB === '200 ml')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                200ml vs 500ml
              </button>
              <button
                type="button"
                onClick={() => {
                  setSizeA('500 ml');
                  setSizeB('1 Litre');
                  setCompareSizes(['500 ml', '1 Litre']);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  (sizeA === '500 ml' && sizeB === '1 Litre') || (sizeA === '1 Litre' && sizeB === '500 ml')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                500ml vs 1L (Best Value)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSizeA('200 ml');
                  setSizeB('1 Litre');
                  setCompareSizes(['200 ml', '1 Litre']);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  (sizeA === '200 ml' && sizeB === '1 Litre') || (sizeA === '1 Litre' && sizeB === '200 ml')
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                200ml vs 1L
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-bold text-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('perPackage')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'perPackage'
                    ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Per Container Yield
              </button>
              <button
                type="button"
                onClick={() => setViewMode('per100ml')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'per100ml'
                    ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Per 100 ml (Baseline)
              </button>
            </div>
          </div>

          {/* Size Selectors Columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center">
            {/* Left Selection Column */}
            <div className="bg-stone-50 p-2.5 sm:p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Size 1 (Left)
              </span>
              <div className="flex gap-1">
                {sizeOptions.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSelectSizeA(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      sizeA === sz
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Selection Column */}
            <div className="bg-stone-50 p-2.5 sm:p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Size 2 (Right)
              </span>
              <div className="flex items-center gap-1">
                {sizeOptions.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSelectSizeB(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      sizeB === sz
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap Columns"
                  className="ml-1 p-1 text-stone-500 hover:text-emerald-800 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-200 p-4 sm:p-6 space-y-6">
          {/* 1. Comparison Product Cards & Value Overview */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 items-stretch">
            {/* Column A Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                    {sizeA}
                  </span>
                  {isAMoreEconomical && savingsPercent > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Save {savingsPercent}% / ml
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {productA && productA.images && productA.images[0] && (
                    <img
                      src={productA.images[0]}
                      alt={productA.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight">
                      {productA?.name || `NIRA Unfiltered Coconut Oil (${sizeA})`}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">{dataA.containerType}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-serif">₹{priceA}</span>
                  <span className="text-xs text-stone-500 font-medium">
                    (₹{pricePer100mlA.toFixed(1)} / 100ml)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleAddProduct(productA)}
                  className="py-2 px-2 sm:px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyProduct(productA)}
                  className="py-2 px-2 sm:px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buy</span>
                </button>
              </div>
            </div>

            {/* Column B Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                    {sizeB}
                  </span>
                  {isBMoreEconomical && savingsPercent > 0 && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Save {savingsPercent}% / ml
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {productB && productB.images && productB.images[0] && (
                    <img
                      src={productB.images[0]}
                      alt={productB.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-stone-200 shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-tight">
                      {productB?.name || `NIRA Unfiltered Coconut Oil (${sizeB})`}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">{dataB.containerType}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-stone-900 font-serif">₹{priceB}</span>
                  <span className="text-xs text-stone-500 font-medium">
                    (₹{pricePer100mlB.toFixed(1)} / 100ml)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleAddProduct(productB)}
                  className="py-2 px-2 sm:px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyProduct(productB)}
                  className="py-2 px-2 sm:px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buy</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Macronutrients Table Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Energy & Healthy Fats Profile</span>
              </h4>
              <span className="text-[11px] font-semibold text-stone-500">
                {viewMode === 'perPackage' ? 'Showing full container totals' : 'Showing 100ml standard concentration'}
              </span>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs">
              {/* Energy */}
              <div className="grid grid-cols-12 bg-stone-50/70 p-2.5 sm:p-3 items-center font-medium">
                <div className="col-span-6 text-stone-700 font-semibold flex items-center gap-1">
                  <span>Energy (Calories)</span>
                </div>
                <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.energyKcal} kcal` : `${BASE_100ML_MACROS.energyKcal} kcal`}
                </div>
                <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.energyKcal} kcal` : `${BASE_100ML_MACROS.energyKcal} kcal`}
                </div>
              </div>

              {/* Total Fat */}
              <div className="grid grid-cols-12 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">Total Lipids / Fats</div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left font-semibold">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.totalFatG} g` : `${BASE_100ML_MACROS.totalFatG} g`}
                </div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left font-semibold">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.totalFatG} g` : `${BASE_100ML_MACROS.totalFatG} g`}
                </div>
              </div>

              {/* Saturated Fat */}
              <div className="grid grid-cols-12 bg-stone-50/40 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium pl-2 border-l-2 border-amber-400">
                  Saturated Fatty Acids
                </div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.saturatedFatG} g` : `${BASE_100ML_MACROS.saturatedFatG} g`}
                </div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.saturatedFatG} g` : `${BASE_100ML_MACROS.saturatedFatG} g`}
                </div>
              </div>

              {/* Lauric Acid C12 Highlight */}
              <div className="grid grid-cols-12 bg-emerald-50/60 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-emerald-950 font-bold pl-2 border-l-2 border-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <div>
                    <span>Lauric Acid (C12 MCT)</span>
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

              {/* Caprylic & Capric Acid C8/C10 MCTs */}
              <div className="grid grid-cols-12 bg-amber-50/50 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-800 font-semibold pl-2 border-l-2 border-amber-500">
                  <div>Caprylic & Capric MCTs (C8+C10)</div>
                  <div className="text-[10px] text-stone-500 font-normal">Instant cellular ketone energy</div>
                </div>
                <div className="col-span-3 font-bold text-amber-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.caprylicCapricMctG} g` : `${BASE_100ML_MACROS.caprylicCapricMctG} g`}
                </div>
                <div className="col-span-3 font-bold text-amber-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.caprylicCapricMctG} g` : `${BASE_100ML_MACROS.caprylicCapricMctG} g`}
                </div>
              </div>

              {/* Monounsaturated (Oleic) */}
              <div className="grid grid-cols-12 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">Monounsaturated (Oleic Acid)</div>
                <div className="col-span-3 text-stone-700 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.monounsaturatedFatG} g` : `${BASE_100ML_MACROS.monounsaturatedFatG} g`}
                </div>
                <div className="col-span-3 text-stone-700 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.monounsaturatedFatG} g` : `${BASE_100ML_MACROS.monounsaturatedFatG} g`}
                </div>
              </div>

              {/* Polyunsaturated (Linoleic) */}
              <div className="grid grid-cols-12 bg-stone-50/40 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">Polyunsaturated (Linoleic Acid)</div>
                <div className="col-span-3 text-stone-700 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.macros.polyunsaturatedFatG} g` : `${BASE_100ML_MACROS.polyunsaturatedFatG} g`}
                </div>
                <div className="col-span-3 text-stone-700 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.macros.polyunsaturatedFatG} g` : `${BASE_100ML_MACROS.polyunsaturatedFatG} g`}
                </div>
              </div>

              {/* Trans Fat & Cholesterol */}
              <div className="grid grid-cols-12 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">Trans Fatty Acids & Cholesterol</div>
                <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">
                  0.0 g / 0 mg (Zero)
                </div>
                <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">
                  0.0 g / 0 mg (Zero)
                </div>
              </div>
            </div>
          </div>

          {/* 3. Unfiltered Bio-Actives & Micronutrients Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <span>Preserved Bio-Actives & Micronutrients (Unfiltered)</span>
              </h4>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Zero Chemical Bleaching
              </span>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs">
              {/* Vitamin E */}
              <div className="grid grid-cols-12 bg-amber-50/30 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-800 font-semibold">
                  <div>Natural Tocopherols (Vitamin E)</div>
                  <div className="text-[10px] text-stone-500 font-normal">Antioxidant cell protector</div>
                </div>
                <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.micros.vitaminEMg} mg` : `${BASE_100ML_MICROS.vitaminEMg} mg`}
                </div>
                <div className="col-span-3 font-bold text-stone-900 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.micros.vitaminEMg} mg` : `${BASE_100ML_MICROS.vitaminEMg} mg`}
                </div>
              </div>

              {/* Total Polyphenols */}
              <div className="grid grid-cols-12 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-800 font-semibold">
                  <div>Total Active Polyphenols</div>
                  <div className="text-[10px] text-stone-500 font-normal">Natural anti-inflammatory phytocompounds</div>
                </div>
                <div className="col-span-3 font-bold text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.micros.polyphenolsMgGae} mg GAE` : `${BASE_100ML_MICROS.polyphenolsMgGae} mg GAE`}
                </div>
                <div className="col-span-3 font-bold text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.micros.polyphenolsMgGae} mg GAE` : `${BASE_100ML_MICROS.polyphenolsMgGae} mg GAE`}
                </div>
              </div>

              {/* Plant Phytosterols */}
              <div className="grid grid-cols-12 bg-stone-50/50 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">Plant Sterols (Phytosterols)</div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsA.micros.phytosterolsMg} mg` : `${BASE_100ML_MICROS.phytosterolsMg} mg`}
                </div>
                <div className="col-span-3 text-stone-800 text-center sm:text-left">
                  {viewMode === 'perPackage' ? `${packNutrientsB.micros.phytosterolsMg} mg` : `${BASE_100ML_MICROS.phytosterolsMg} mg`}
                </div>
              </div>

              {/* Free Fatty Acids */}
              <div className="grid grid-cols-12 p-2.5 sm:p-3 items-center">
                <div className="col-span-6 text-stone-700 font-medium">
                  <div>Free Fatty Acids (as Oleic)</div>
                  <div className="text-[10px] text-stone-400 font-normal">FSSAI Limit: 0.50%</div>
                </div>
                <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">
                  {BASE_100ML_MICROS.freeFattyAcidsPercent}
                </div>
                <div className="col-span-3 text-emerald-800 font-bold text-center sm:text-left">
                  {BASE_100ML_MICROS.freeFattyAcidsPercent}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Practical Packaging & Usage Specs */}
          <div className="pt-4 space-y-3">
            <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-800" />
              <span>Packaging & Recommended Usage Suitability</span>
            </h4>

            <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 text-xs">
              {/* Best Suited For */}
              <div className="grid grid-cols-12 p-3 bg-stone-50/70 items-start">
                <div className="col-span-4 sm:col-span-4 text-stone-800 font-bold">Ideal Applications</div>
                <div className="col-span-4 sm:col-span-4 text-stone-700 pr-2 leading-relaxed">
                  {dataA.recommendedUse}
                </div>
                <div className="col-span-4 sm:col-span-4 text-stone-700 pl-2 leading-relaxed">
                  {dataB.recommendedUse}
                </div>
              </div>

              {/* Best Suited Audience */}
              <div className="grid grid-cols-12 p-3 items-start">
                <div className="col-span-4 sm:col-span-4 text-stone-800 font-bold">Recommended For</div>
                <div className="col-span-4 sm:col-span-4 text-stone-600 pr-2">
                  {dataA.bestSuitedAudience}
                </div>
                <div className="col-span-4 sm:col-span-4 text-stone-600 pl-2">
                  {dataB.bestSuitedAudience}
                </div>
              </div>

              {/* Packaging Material */}
              <div className="grid grid-cols-12 p-3 bg-stone-50/70 items-start">
                <div className="col-span-4 sm:col-span-4 text-stone-800 font-bold">Container Material</div>
                <div className="col-span-4 sm:col-span-4 text-stone-600 pr-2">
                  {dataA.packagingMaterial}
                </div>
                <div className="col-span-4 sm:col-span-4 text-stone-600 pl-2">
                  {dataB.packagingMaterial}
                </div>
              </div>

              {/* Smoke Point & Shelf Life */}
              <div className="grid grid-cols-12 p-3 items-center">
                <div className="col-span-4 sm:col-span-4 text-stone-800 font-bold">Smoke Point & Shelf Life</div>
                <div className="col-span-4 sm:col-span-4 text-stone-700 pr-2">
                  204°C (400°F) • 12 Months
                </div>
                <div className="col-span-4 sm:col-span-4 text-stone-700 pl-2">
                  204°C (400°F) • 12 Months
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary Notice */}
        <div className="p-4 sm:px-6 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span>
              All NIRA coconut oil sizes contain identical 100% Raw Unfiltered Kerala expeller-pressed oil.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-stone-700 hover:text-stone-950 font-bold px-4 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 transition-colors shrink-0"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
