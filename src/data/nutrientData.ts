import { ProductSize } from '../types';

export interface MacroNutrientProfile {
  energyKcal: number;
  energyKj: number;
  totalFatG: number;
  saturatedFatG: number;
  lauricAcidG: number; // C12 MCT (Active immunity)
  caprylicCapricMctG: number; // C8 + C10 MCTs (Quick energy)
  myristicAcidG: number; // C14
  palmiticAcidG: number; // C16
  monounsaturatedFatG: number; // Oleic acid C18:1
  polyunsaturatedFatG: number; // Linoleic acid C18:2
  transFatG: number;
  cholesterolMg: number;
  carbohydratesG: number;
  proteinG: number;
}

export interface MicroNutrientProfile {
  vitaminEMg: number; // Natural Tocopherols & Tocotrienols
  polyphenolsMgGae: number; // Phenolic antioxidants preserved by gravity settling
  phytosterolsMg: number; // Plant sterols (Beta-sitosterol, campesterol)
  freeFattyAcidsPercent: string; // FSSAI max 0.5%, NIRA < 0.25%
  moisturePercent: string; // Max 0.25%, NIRA < 0.12%
  peroxideValue: string; // Freshness measure
}

export interface SizeNutrientInfo {
  size: ProductSize;
  volumeMl: number;
  containerType: string;
  packagingMaterial: string;
  recommendedUse: string;
  bestSuitedAudience: string;
  basePrice: number;
  per100mlProfile: {
    macros: MacroNutrientProfile;
    micros: MicroNutrientProfile;
  };
}

// Standardized 100ml baseline for 100% Raw Unfiltered Kerala Coconut Oil
export const BASE_100ML_MACROS: MacroNutrientProfile = {
  energyKcal: 884,
  energyKj: 3700,
  totalFatG: 100.0,
  saturatedFatG: 86.8,
  lauricAcidG: 51.8, // 51.8% Lauric acid
  caprylicCapricMctG: 14.5, // 14.5% C8/C10 MCTs
  myristicAcidG: 17.2,
  palmiticAcidG: 8.5,
  monounsaturatedFatG: 5.8,
  polyunsaturatedFatG: 1.8,
  transFatG: 0.0,
  cholesterolMg: 0.0,
  carbohydratesG: 0.0,
  proteinG: 0.0
};

export const BASE_100ML_MICROS: MicroNutrientProfile = {
  vitaminEMg: 2.1, // Preserved due to zero industrial micro-filtering
  polyphenolsMgGae: 84.0, // Natural antioxidants
  phytosterolsMg: 96.0,
  freeFattyAcidsPercent: '< 0.25% (as Oleic)',
  moisturePercent: '< 0.12%',
  peroxideValue: '< 0.5 meq O2/kg'
};

export const SIZE_NUTRIENT_DATA: Record<string, SizeNutrientInfo> = {
  '200 ml': {
    size: '200 ml',
    volumeMl: 200,
    containerType: 'Aroma-Barrier Hermetic Pouch',
    packagingMaterial: 'Multi-layer food-grade barrier pouch with nitrogen seal',
    recommendedUse: 'Daily hair root massage, infant skin moisturizing, delicate facial glow & Ayurvedic oil pulling',
    bestSuitedAudience: 'Individuals, travelers, trial users, nursery & baby care routines',
    basePrice: 95,
    per100mlProfile: {
      macros: BASE_100ML_MACROS,
      micros: BASE_100ML_MICROS
    }
  },
  '500 ml': {
    size: '500 ml',
    volumeMl: 500,
    containerType: 'UV-Protected Food-Grade Bottle',
    packagingMaterial: '100% Virgin recyclable BPA-free food contact bottle with precision flip cap',
    recommendedUse: 'Daily kitchen cooking & sautéing, mustard seed tempering, scalp conditioning & body Abhyanga',
    bestSuitedAudience: 'Couples, small families, fitness & keto wellness routines',
    basePrice: 195,
    per100mlProfile: {
      macros: BASE_100ML_MACROS,
      micros: BASE_100ML_MICROS
    }
  },
  '1 Litre': {
    size: '1 Litre',
    volumeMl: 1000,
    containerType: 'Ergonomic Pantry Jar / Family Container',
    packagingMaterial: 'Heavy-duty food-grade container with sturdy grip handle and airtight cap',
    recommendedUse: 'High-heat family cooking, deep frying, baking, weekly family head baths & dispenser refills',
    bestSuitedAudience: 'Healthy families, authentic Kerala culinary lovers, bulk value seekers',
    basePrice: 375,
    per100mlProfile: {
      macros: BASE_100ML_MACROS,
      micros: BASE_100ML_MICROS
    }
  }
};

/**
 * Calculates scaled nutrients for the full package container volume
 */
export function getPackageTotalNutrients(size: ProductSize) {
  const info = SIZE_NUTRIENT_DATA[size] || SIZE_NUTRIENT_DATA['500 ml'];
  const multiplier = info.volumeMl / 100;

  const totalMacros: MacroNutrientProfile = {
    energyKcal: Math.round(BASE_100ML_MACROS.energyKcal * multiplier),
    energyKj: Math.round(BASE_100ML_MACROS.energyKj * multiplier),
    totalFatG: Number((BASE_100ML_MACROS.totalFatG * multiplier).toFixed(1)),
    saturatedFatG: Number((BASE_100ML_MACROS.saturatedFatG * multiplier).toFixed(1)),
    lauricAcidG: Number((BASE_100ML_MACROS.lauricAcidG * multiplier).toFixed(1)),
    caprylicCapricMctG: Number((BASE_100ML_MACROS.caprylicCapricMctG * multiplier).toFixed(1)),
    myristicAcidG: Number((BASE_100ML_MACROS.myristicAcidG * multiplier).toFixed(1)),
    palmiticAcidG: Number((BASE_100ML_MACROS.palmiticAcidG * multiplier).toFixed(1)),
    monounsaturatedFatG: Number((BASE_100ML_MACROS.monounsaturatedFatG * multiplier).toFixed(1)),
    polyunsaturatedFatG: Number((BASE_100ML_MACROS.polyunsaturatedFatG * multiplier).toFixed(1)),
    transFatG: 0,
    cholesterolMg: 0,
    carbohydratesG: 0,
    proteinG: 0
  };

  const totalMicros: MicroNutrientProfile = {
    vitaminEMg: Number((BASE_100ML_MICROS.vitaminEMg * multiplier).toFixed(1)),
    polyphenolsMgGae: Math.round(BASE_100ML_MICROS.polyphenolsMgGae * multiplier),
    phytosterolsMg: Math.round(BASE_100ML_MICROS.phytosterolsMg * multiplier),
    freeFattyAcidsPercent: BASE_100ML_MICROS.freeFattyAcidsPercent,
    moisturePercent: BASE_100ML_MICROS.moisturePercent,
    peroxideValue: BASE_100ML_MICROS.peroxideValue
  };

  return {
    volumeMl: info.volumeMl,
    macros: totalMacros,
    micros: totalMicros,
    pricePer100ml: Number((info.basePrice / multiplier).toFixed(2))
  };
}
