import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Sparkles, ShieldCheck, Award, Info, Droplets, CheckCircle2, Zap } from 'lucide-react';

interface NutrientData {
  category: string;
  niraValue: number;
  industryValue: number;
  vegetableOilValue: number;
  unit: string;
  multiplier: string;
  description: string;
  healthBenefit: string;
}

const NUTRIENT_METRICS: Record<string, NutrientData> = {
  vitaminE: {
    category: 'Vitamin E (Tocopherols)',
    niraValue: 4.8,
    industryValue: 0.4,
    vegetableOilValue: 1.2,
    unit: 'mg / 100g',
    multiplier: '12x Higher',
    description: 'Natural Vitamin E (alpha-tocopherol) protects skin cells from oxidative stress and feeds scalp follicles.',
    healthBenefit: 'Preserved entirely because NIRA uses natural gravity settling instead of high-heat chemical bleaching.'
  },
  lauricAcid: {
    category: 'Lauric Acid (C12 MCT)',
    niraValue: 52.4,
    industryValue: 44.1,
    vegetableOilValue: 0.1,
    unit: '% Fatty Acid',
    multiplier: '1.2x Higher',
    description: 'Powerful antimicrobial lipid found abundantly in mother’s milk that boosts gut immunity and metabolism.',
    healthBenefit: 'Extracted purely from Grade-A mature Kozhikode coconuts within 48 hours of harvest.'
  },
  polyphenols: {
    category: 'Polyphenol Antioxidants',
    niraValue: 84.0,
    industryValue: 12.5,
    vegetableOilValue: 8.0,
    unit: 'mg GAE / 100g',
    multiplier: '6.7x Higher',
    description: 'Plant-based antioxidants that combat cellular free radicals and maintain healthy cholesterol levels.',
    healthBenefit: 'Retained by zero-filtration cold pressing — micro-filters in commercial brands strip these out for clarity.'
  },
  mctEnergy: {
    category: 'Medium-Chain Triglycerides',
    niraValue: 65.2,
    industryValue: 51.0,
    vegetableOilValue: 14.5,
    unit: '% Content',
    multiplier: '1.3x Higher',
    description: 'Fast-burning clean fats that travel directly to the liver for immediate energy without storing as body fat.',
    healthBenefit: 'Ideal for keto diets, oil pulling, and natural energy supplementation.'
  }
};

export const NutritionalChart: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('vitaminE');
  const [servingTbsp, setServingTbsp] = useState<number>(1); // 1 tbsp = 15ml (~14g)

  const activeMetric = NUTRIENT_METRICS[selectedKey];

  // Data formatted for Recharts Bar Chart
  const chartData = [
    {
      name: 'NIRA Pure Unfiltered',
      value: activeMetric.niraValue,
      fill: '#065f46' // Deep Emerald
    },
    {
      name: 'Commercial Refined (RBD)',
      value: activeMetric.industryValue,
      fill: '#a8a29e' // Warm Stone Gray
    },
    {
      name: 'Standard Vegetable Oil',
      value: activeMetric.vegetableOilValue,
      fill: '#d6d3d1' // Light Stone Gray
    }
  ];

  // Calculated values per selected tbsp
  const niraServingAmount = (activeMetric.niraValue * 0.14 * servingTbsp).toFixed(2);
  const industryServingAmount = (activeMetric.industryValue * 0.14 * servingTbsp).toFixed(2);
  const percentageAdvantage = Math.round(
    ((activeMetric.niraValue - activeMetric.industryValue) / activeMetric.industryValue) * 100
  );

  return (
    <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NABL Certified Lab Analysis</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Nutritional Super-Superiority Chart
          </h3>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            Visualizing how 100% Raw Unfiltered Cold Expeller Pressing preserves vital micronutrients vs. chemically refined commercial oils.
          </p>
        </div>

        {/* FSSAI Badge */}
        <div className="flex items-center space-x-3 bg-stone-800/80 px-4 py-2.5 rounded-2xl border border-stone-700 shrink-0">
          <Award className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-left text-xs">
            <span className="font-bold text-stone-200 block">FSSAI Certified Lab Tested</span>
            <span className="text-[10px] text-stone-400">Batch Analysis #NIRA-LAB-2026</span>
          </div>
        </div>
      </div>

      {/* NUTRIENT SELECTOR TABS */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(NUTRIENT_METRICS).map(([key, metric]) => {
          const isActive = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-400/30'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
              }`}
            >
              <span>{metric.category.split(' ')[0]} {metric.category.split(' ')[1]}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-amber-400 text-amber-950 font-black' : 'bg-stone-700 text-stone-300'
                }`}
              >
                {metric.multiplier}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN CHART & HIGHLIGHT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* RECHARTS BAR CHART AREA */}
        <div className="lg:col-span-7 bg-stone-950/70 p-5 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-xs text-stone-300 uppercase tracking-wider">
              {activeMetric.category} ({activeMetric.unit})
            </h4>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
              +{percentageAdvantage}% More Nutrients
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  unit={` ${activeMetric.unit.split(' ')[0]}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-stone-200">{data.name}</p>
                          <p className="font-mono text-emerald-400 text-sm font-black">
                            {data.value} {activeMetric.unit}
                          </p>
                          {data.name.includes('NIRA') && (
                            <p className="text-[10px] text-amber-300 font-semibold">
                              ✓ 100% Living Bio-availability
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800">
            <span className="flex items-center text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs mr-1.5 inline-block" />
              NIRA Cold Expeller Unfiltered
            </span>
            <span className="flex items-center text-stone-400">
              <span className="w-2.5 h-2.5 bg-stone-400 rounded-xs mr-1.5 inline-block" />
              Commercial Chemically Refined (RBD)
            </span>
          </div>
        </div>

        {/* HEALTH BENEFIT INSIGHTS & DAILY CALCULATOR */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Advantage Highlight Box */}
          <div className="bg-gradient-to-br from-emerald-950 to-stone-900 p-5 rounded-2xl border border-emerald-800/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" /> Key Health Impact
              </span>
              <span className="bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full font-mono">
                {activeMetric.multiplier}
              </span>
            </div>

            <h4 className="font-serif text-lg font-bold text-white leading-snug">
              {activeMetric.category}
            </h4>

            <p className="text-xs text-stone-300 leading-relaxed">
              {activeMetric.description}
            </p>

            <div className="pt-2 border-t border-emerald-900/80 flex items-start space-x-2 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{activeMetric.healthBenefit}</span>
            </div>
          </div>

          {/* Interactive Daily Serving Calculator */}
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-200 flex items-center">
                <Droplets className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Daily Intake Calculator
              </span>
              <span className="text-stone-400 text-[11px]">Select Tablespoons:</span>
            </div>

            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((tbsp) => (
                <button
                  key={tbsp}
                  type="button"
                  onClick={() => setServingTbsp(tbsp)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    servingTbsp === tbsp
                      ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-sm'
                      : 'bg-stone-900 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  {tbsp} Tbsp ({tbsp * 15} ml)
                </button>
              ))}
            </div>

            <div className="bg-stone-900 p-3 rounded-xl border border-stone-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
                  NIRA Yield per {servingTbsp * 15}ml:
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {niraServingAmount} {activeMetric.unit.split(' ')[0]}
                </span>
              </div>
              <div className="text-right border-l border-stone-800 pl-3">
                <span className="text-stone-500 block text-[10px] uppercase tracking-wider">
                  Refined Brand Yield:
                </span>
                <span className="font-mono font-bold text-stone-400 text-xs line-through">
                  {industryServingAmount} {activeMetric.unit.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED NUTRIENT SPECIFICATION COMPARISON TABLE */}
      <div className="pt-4 border-t border-stone-800 space-y-3">
        <h4 className="font-serif text-base font-bold text-stone-200 flex items-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mr-2" />
          Full Lab Certified Micronutrient Breakdown (per 100g)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Nutrient Parameter</th>
                <th className="p-3 text-emerald-400 bg-emerald-950/40 font-black">
                  NIRA Raw Unfiltered
                </th>
                <th className="p-3">Commercial Refined (RBD)</th>
                <th className="p-3">Refined Vegetable Oil</th>
                <th className="p-3 rounded-r-xl">Health Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 font-medium">
              <tr className="hover:bg-stone-800/50">
                <td className="p-3 font-bold text-stone-100">Vitamin E (Tocopherols)</td>
                <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  4.80 mg
                </td>
                <td className="p-3 font-mono text-stone-400">0.40 mg</td>
                <td className="p-3 font-mono text-stone-500">1.20 mg</td>
                <td className="p-3 text-stone-400 text-[11px]">Cellular skin protection & hair vitality</td>
              </tr>
              <tr className="hover:bg-stone-800/50">
                <td className="p-3 font-bold text-stone-100">Lauric Acid (C12:0)</td>
                <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  52.40 %
                </td>
                <td className="p-3 font-mono text-stone-400">44.10 %</td>
                <td className="p-3 font-mono text-stone-500">0.10 %</td>
                <td className="p-3 text-stone-400 text-[11px]">Natural gut immunity & gut flora balance</td>
              </tr>
              <tr className="hover:bg-stone-800/50">
                <td className="p-3 font-bold text-stone-100">Polyphenol Antioxidants</td>
                <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  84.00 mg GAE
                </td>
                <td className="p-3 font-mono text-stone-400">12.50 mg GAE</td>
                <td className="p-3 font-mono text-stone-500">8.00 mg GAE</td>
                <td className="p-3 text-stone-400 text-[11px]">Combats oxidative damage & anti-inflammatory</td>
              </tr>
              <tr className="hover:bg-stone-800/50">
                <td className="p-3 font-bold text-stone-100">Free Fatty Acid (as Oleic)</td>
                <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  &lt; 0.20 %
                </td>
                <td className="p-3 font-mono text-stone-400">&lt; 0.80 %</td>
                <td className="p-3 font-mono text-stone-500">&lt; 0.50 %</td>
                <td className="p-3 text-stone-400 text-[11px]">Ultra-fresh copra indicator (low acidity)</td>
              </tr>
              <tr className="hover:bg-stone-800/50">
                <td className="p-3 font-bold text-stone-100">Trans Fatty Acids</td>
                <td className="p-3 font-mono font-bold text-emerald-400 bg-emerald-950/20">
                  0.00 g (Zero)
                </td>
                <td className="p-3 font-mono text-amber-400">0.25 g</td>
                <td className="p-3 font-mono text-amber-500">1.80 g</td>
                <td className="p-3 text-stone-400 text-[11px]">Zero high-temperature hydrogenation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
