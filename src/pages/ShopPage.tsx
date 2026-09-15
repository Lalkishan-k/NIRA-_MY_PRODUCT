import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, SlidersHorizontal, Search, RefreshCw, ArrowLeftRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { CompareSection } from '../components/CompareSection';

export const ShopPage: React.FC = () => {
  const { products, isLoadingProducts, openCompare } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSize = searchParams.get('size') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState<string>('popular');

  const sizeOptions = ['All Sizes', '200 ml', '500 ml', '1 Litre'];

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.active);

    if (selectedSize !== 'All') {
      list = list.filter(p => p.size === selectedSize);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          p.benefits.some(b => b.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }, [products, selectedSize, searchQuery, sortBy]);

  const handleSizeSelect = (sz: string) => {
    const params = new URLSearchParams(searchParams);
    if (sz === 'All Sizes') {
      params.delete('size');
    } else {
      params.set('size', sz);
    }
    setSearchParams(params);
  };

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete('search');
    } else {
      params.set('search', val);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Helmet>
        <title>Shop Unfiltered Pure Coconut Oil (200ml, 500ml, 1 Litre) | NIRA</title>
        <meta
          name="description"
          content="Buy 100% authentic, raw unfiltered Kerala coconut oil in 200 ml, 500 ml, and 1 Litre bottles. Rich in Vitamin E, polyphenols, and healthy MCTs."
        />
        <meta property="og:title" content="Shop Raw Unfiltered Coconut Oil | NIRA Kerala" />
        <meta property="og:description" content="Discover 100% pure unfiltered coconut oil with natural sediment, roasted aroma, and rich nutrients. Available in 200ml, 500ml & 1L." />
        <link rel="canonical" href="https://nira.farm/shop" />
      </Helmet>

      {/* Header Banner */}
      <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-bold">
            Raw, Unfiltered & Nutrient Rich
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Unfiltered Pure Coconut Oil
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            We focus exclusively on one product: 100% pure, unfiltered Kerala coconut oil. Because it is never subjected to destructive industrial micro-filtration, it retains maximum natural Vitamin E, polyphenols, plant sterols, and authentic roasted aroma. Available in 3 convenient packaging sizes.
          </p>
        </div>
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Size Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-stone-500 mr-1 hidden sm:inline">Packaging:</span>
          {sizeOptions.map(sz => {
            const isSelected = (sz === 'All Sizes' && selectedSize === 'All') || selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => handleSizeSelect(sz)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>

        {/* Search, Sort & Compare Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Compare Modal Opener */}
          <button
            type="button"
            onClick={() => openCompare('200 ml', '500 ml')}
            className="px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
            <span>Compare Sizes</span>
          </button>

          {/* Search bar inside shop */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search oil or benefits..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full sm:w-auto text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filters notice */}
      {(selectedSize !== 'All' || searchQuery) && (
        <div className="flex items-center justify-between text-xs bg-stone-100 px-4 py-2 rounded-xl text-stone-600">
          <span>
            Showing results {selectedSize !== 'All' && <b>for size &ldquo;{selectedSize}&rdquo;</b>}{' '}
            {searchQuery && <b>matching &ldquo;{searchQuery}&rdquo;</b>} ({filteredProducts.length} items)
          </span>
          <button
            onClick={clearAllFilters}
            className="text-emerald-800 font-semibold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Clear filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-stone-100 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">No products match your criteria</h3>
          <p className="text-xs text-stone-500">
            Try resetting your search query or selecting another packaging size.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 bg-emerald-800 text-white rounded-full text-xs font-semibold hover:bg-emerald-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* In-Page Compare Section */}
      <div className="pt-6">
        <CompareSection />
      </div>
    </div>
  );
};
