import { Product, Coupon, StoreSettings } from '../types';
import {
  pureOilBottle,
  virginOilBottle,
  niraPure1LBottle,
  niraPouch200ml,
  heroCoconutOil,
  childPureOil,
  keralaCooking,
  coconutHarvest
} from '../assets/images';

export const initialProducts: Product[] = [
  {
    id: 'prod-pco-200ml',
    name: 'NIRA Unfiltered Pure Coconut Oil — 200 ml',
    slug: 'unfiltered-pure-coconut-oil-200ml',
    category: 'Unfiltered Pure Coconut Oil',
    shortDescription: '100% Raw, Unfiltered Kerala Coconut Oil in an authentic 200 ml pouch pack. Unfiltered means maximum natural nutrients, Vitamin E & polyphenols intact.',
    description: 'Extracted from prime Kerala coconuts sun-dried without sulphur and expeller pressed at gentle room temperatures. Unlike industrially filtered commercial oils, NIRA is completely unfiltered — naturally settled by gravity. Leaving the oil unfiltered preserves the full spectrum of micronutrients, natural tocopherols (Vitamin E), plant sterols, and healthy medium-chain triglycerides (MCTs / Lauric acid) that industrial micro-filtering and chemical bleaching routinely strip away. Perfect compact size for daily hair root nourishment, infant massage, face hydration, and trial.',
    price: 95,
    compareAtPrice: 120,
    discount: 21,
    stock: 110,
    sku: 'NIRA-UF-200',
    size: '200 ml',
    unit: 'Pouch',
    images: [
      niraPouch200ml,
      childPureOil,
      keralaCooking,
      heroCoconutOil
    ],
    ingredients: ['100% Raw Unfiltered Pure Coconut Oil (Cocos nucifera)'],
    benefits: [
      'Unfiltered Nutritive Advantage: Retains native Vitamin E, polyphenols, and plant sterols intact',
      'Over 50% Natural Lauric Acid & bioactive MCTs for cellular vitality',
      'Zero Industrial Filtration: Settled naturally by gentle gravity, never forced through micro-mesh or bleaching clays',
      'Non-hydrogenated, 100% sulphur-free, and chemical additive-free',
      'Deeply nourishing for stimulating hair growth, soothing dry skin & gentle baby massage'
    ],
    usage: [
      'Daily scalp and hair root massage 30 minutes prior to shower',
      'Natural body and infant massage for skin barrier strength',
      'Delicate facial oil and dry cuticle moisturizer',
      'Ayurvedic oil pulling (Gandusha) every morning'
    ],
    storage: 'Store at ambient room temperature away from direct sunlight. Solidifies naturally below 24°C into a silky white cream without any change in nutrients or purity.',
    specifications: {
      extractionMethod: 'Traditional cold expeller pressed & natural gravity settling (Zero Filtration)',
      shelfLife: '12 Months from packaging date',
      aroma: 'Deep, authentic roasted Kerala coconut bouquet',
      smokePoint: '204°C (400°F)',
      source: 'Malabar Heritage Coconut Groves, Kozhikode, Kerala',
      fssaiLicense: '11322007000341'
    },
    featured: true,
    active: true,
    rating: 4.94,
    reviewCount: 168,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-09-10T08:30:00.000Z'
  },
  {
    id: 'prod-pco-500ml',
    name: 'NIRA Unfiltered Pure Coconut Oil — 500 ml',
    slug: 'unfiltered-pure-coconut-oil-500ml',
    category: 'Unfiltered Pure Coconut Oil',
    shortDescription: 'Our signature kitchen & personal care staple. 100% Raw & Unfiltered for higher nutritional value, rich aroma, and natural golden clarity.',
    description: 'The golden standard of authentic Kerala coconut oil. Our 500 ml bottle delivers raw, unfiltered NIRA purity directly from Malabar family groves to your household. Because we deliberately bypass high-pressure micro-mesh filtration, the delicate heat-sensitive bio-actives, natural antioxidants, and essential fatty acids remain fully intact. The result is an oil with an intensely aromatic toasted coconut fragrance, a silky mouthfeel, and unmatched health benefits for wholesome cooking, sautéing, hair conditioning, and daily wellness.',
    price: 195,
    compareAtPrice: 240,
    discount: 19,
    stock: 85,
    sku: 'NIRA-UF-500',
    size: '500 ml',
    unit: 'Bottle',
    images: [
      pureOilBottle,
      keralaCooking,
      childPureOil,
      heroCoconutOil
    ],
    ingredients: ['100% Raw Unfiltered Pure Coconut Oil (Cocos nucifera)'],
    benefits: [
      'Maximum Nutrients Preserved: Unfiltered extraction protects antioxidant polyphenols & Vitamin E',
      'Rich in Lauric Acid (50%+): Converts into monolaurin to support immune defenses and gut microbiome',
      'Naturally High Smoke Point (204°C): Safe for traditional Indian tadka, pan-roasting, and deep frying',
      'Pristine Heritage Quality: Absolutely zero sulphur, artificial preservatives, chemical deodorizers, or mineral oils',
      'All-in-one culinary, skin hydration, and Ayurvedic self-care formula'
    ],
    usage: [
      'Daily cooking, tempering mustard and curry leaves, and traditional Kerala preparations',
      'Warm hair conditioning for shiny, resilient tresses',
      'Full body moisturizing and Ayurvedic Abhyanga massage',
      'Nutritious addition to morning bulletproof coffee or warm herbal tea'
    ],
    storage: 'Keep cap tightly closed in a dry kitchen pantry. Solidifies naturally in cooler temperatures — warm gently in hot water if liquid consistency is desired.',
    specifications: {
      extractionMethod: 'Traditional cold expeller pressed & natural gravity settling (Zero Filtration)',
      shelfLife: '12 Months from packaging date',
      aroma: 'Rich, mouthwatering roasted Kerala coconut aroma',
      smokePoint: '204°C (400°F)',
      source: 'Kozhikode & Malabar, Kerala, India',
      fssaiLicense: '11322007000341'
    },
    featured: true,
    active: true,
    rating: 4.96,
    reviewCount: 382,
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-09-10T08:30:00.000Z'
  },
  {
    id: 'prod-pco-1000ml',
    name: 'NIRA Unfiltered Pure Coconut Oil — 1 Litre',
    slug: 'unfiltered-pure-coconut-oil-1-litre',
    category: 'Unfiltered Pure Coconut Oil',
    shortDescription: '1 Litre family value pack. 100% Raw Unfiltered Pure Coconut Oil — the unrefined nutrient-rich kitchen essential for healthy households.',
    description: 'The definitive 1 Litre pantry pack of authentic, unrefined, unfiltered NIRA Kerala coconut oil. Crafted exclusively from ripe coconuts sun-dried on hygienic open courtyards without sulphur burning. By maintaining a strict zero-filtration policy and relying solely on natural gravity settling, every millilitre retains the complete biological nutrient profile of fresh coconuts — polyphenols, tocopherols, and medium-chain fatty acids. Offers exceptional value for complete family cooking, traditional feast preparation, and weekly hair care.',
    price: 375,
    compareAtPrice: 450,
    discount: 17,
    stock: 140,
    sku: 'NIRA-UF-1000',
    size: '1 Litre',
    unit: 'Bottle',
    images: [
      niraPure1LBottle,
      keralaCooking,
      pureOilBottle,
      coconutHarvest
    ],
    ingredients: ['100% Raw Unfiltered Pure Coconut Oil (Cocos nucifera)'],
    benefits: [
      'Complete Biological Nutrient Retention: Unfiltered to preserve natural antioxidants and enzymes',
      'Best Family Value: Lowest cost per millilitre for regular daily household consumption',
      'Unsurpassed Flavor Depth: Infuses authentic Kerala aroma into sambar, fish curry, avial, and thoran',
      'Natural Antimicrobial & Antioxidant Power: 50%+ Lauric acid for superior internal and topical health',
      'Guaranteed 100% pure copra extraction with zero industrial refining or chemical bleaching'
    ],
    usage: [
      'All high-heat Indian cooking, deep-frying, and baking',
      'Refilling household kitchen dispenser bottles and bathroom jars',
      'Weekly family head baths and Ayurvedic oil therapy',
      'Natural wooden utensil and cutting board conditioning'
    ],
    storage: 'Store in a dry cupboard away from direct heat and moisture. Keep bottle sealed after each use.',
    specifications: {
      extractionMethod: 'Traditional cold expeller pressed & natural gravity settling (Zero Filtration)',
      shelfLife: '12 Months from packaging date',
      aroma: 'Intense, sweet toasted coconut bouquet',
      smokePoint: '204°C (400°F)',
      source: 'Malappuram & Thrissur, Kerala',
      fssaiLicense: '11322007000341'
    },
    featured: true,
    active: true,
    rating: 4.97,
    reviewCount: 524,
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-09-10T08:30:00.000Z'
  }
];

export const initialCoupons: Coupon[] = [
  {
    code: 'PURE10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 350,
    maximumDiscount: 150,
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usedCount: 142,
    active: true,
    description: '10% OFF on all orders above ₹350 (Max ₹150)'
  },
  {
    code: 'FLAT50',
    discountType: 'flat',
    discountValue: 50,
    minimumOrderAmount: 499,
    expiryDate: '2027-12-31',
    usageLimit: 500,
    usedCount: 88,
    active: true,
    description: 'Flat ₹50 OFF on orders above ₹499'
  },
  {
    code: 'KERALA15',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrderAmount: 799,
    maximumDiscount: 250,
    expiryDate: '2027-12-31',
    usageLimit: 200,
    usedCount: 45,
    active: true,
    description: '15% OFF for orders above ₹799 (Max ₹250)'
  },
  {
    code: 'RECOVER10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderAmount: 0,
    maximumDiscount: 200,
    expiryDate: '2028-12-31',
    usageLimit: 10000,
    usedCount: 12,
    active: true,
    description: 'Exclusive 10% Recovery Discount on your abandoned order'
  }
];

export const defaultStoreSettings: StoreSettings = {
  brandName: 'NIRA',
  tagline: 'Pure Coconut Oil. Naturally Better.',
  supportPhone: '+91 96563 19693',
  secondaryPhone: '+91 95625 13642',
  supportEmail: 'hello@niraoil.in',
  whatsappNumber: '+919562513642',
  address: {
    line1: 'NIRA Agro-Processing Heritage Unit',
    line2: 'NH 66 Airport Bypass Corridor',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673633'
  },
  freeShippingThreshold: 499,
  shippingCharge: 50,
  announcementText: '🌴 Free Shipping on all orders above ₹499 across India | Freshly Pressed Malabar Batches',
  fssaiNumber: '11322007000341',
  currencySymbol: '₹'
};
