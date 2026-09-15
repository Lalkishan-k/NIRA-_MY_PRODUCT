import { PincodeDeliveryEstimate } from '../types';

interface PincodeRule {
  prefix: string;
  city: string;
  district: string;
  state: string;
  zone: string;
  daysMin: number;
  daysMax: number;
  express: boolean;
  couriers: string[];
}

const PINCODE_MAP: PincodeRule[] = [
  // Kerala - Home Mill & Regional Hubs
  { prefix: '673', city: 'Kozhikode (Calicut)', district: 'Kozhikode', state: 'Kerala', zone: 'Direct Mill Hub', daysMin: 1, daysMax: 1, express: true, couriers: ['NIRA Local Express', 'Kerala Speed Post', 'Delhivery Local'] },
  { prefix: '670', city: 'Kannur', district: 'Kannur', state: 'Kerala', zone: 'North Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery Direct'] },
  { prefix: '671', city: 'Kasaragod', district: 'Kasaragod', state: 'Kerala', zone: 'North Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery Direct'] },
  { prefix: '676', city: 'Malappuram', district: 'Malappuram', state: 'Kerala', zone: 'North Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['NIRA Local Express', 'Speed Post'] },
  { prefix: '679', city: 'Shoranur / Palakkad', district: 'Palakkad', state: 'Kerala', zone: 'North-Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Bluedart'] },
  { prefix: '678', city: 'Palakkad', district: 'Palakkad', state: 'Kerala', zone: 'North-Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery'] },
  { prefix: '680', city: 'Thrissur', district: 'Thrissur', state: 'Kerala', zone: 'Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Bluedart Air'] },
  { prefix: '682', city: 'Kochi (Cochin)', district: 'Ernakulam', state: 'Kerala', zone: 'Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Express Hub', 'Delhivery Prime'] },
  { prefix: '683', city: 'Aluva / Ernakulam', district: 'Ernakulam', state: 'Kerala', zone: 'Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Express Hub', 'Speed Post'] },
  { prefix: '686', city: 'Kottayam', district: 'Kottayam', state: 'Kerala', zone: 'Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery'] },
  { prefix: '688', city: 'Alappuzha (Alleppey)', district: 'Alappuzha', state: 'Kerala', zone: 'South-Central Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery'] },
  { prefix: '690', city: 'Kayamkulam', district: 'Alappuzha', state: 'Kerala', zone: 'South Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Speed Post', 'Delhivery'] },
  { prefix: '691', city: 'Kollam (Quilon)', district: 'Kollam', state: 'Kerala', zone: 'South Kerala', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Bluedart'] },
  { prefix: '695', city: 'Thiruvananthapuram (Trivandrum)', district: 'Thiruvananthapuram', state: 'Kerala', zone: 'South Kerala Capital', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala Speed Post', 'Delhivery Prime'] },

  // Karnataka & Bengaluru
  { prefix: '560', city: 'Bengaluru (Bangalore)', district: 'Bengaluru Urban', state: 'Karnataka', zone: 'South Metro', daysMin: 2, daysMax: 3, express: true, couriers: ['Bluedart Air', 'Delhivery Express'] },
  { prefix: '570', city: 'Mysuru (Mysore)', district: 'Mysuru', state: 'Karnataka', zone: 'South Karnataka', daysMin: 2, daysMax: 3, express: true, couriers: ['Bluedart Air', 'Speed Post'] },
  { prefix: '575', city: 'Mangaluru (Mangalore)', district: 'Dakshina Kannada', state: 'Karnataka', zone: 'Coastal Karnataka', daysMin: 1, daysMax: 2, express: true, couriers: ['Kerala-Karnataka Express', 'Speed Post'] },

  // Tamil Nadu
  { prefix: '600', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', zone: 'South Metro', daysMin: 2, daysMax: 3, express: true, couriers: ['Bluedart Air', 'Delhivery Express'] },
  { prefix: '641', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', zone: 'Western Tamil Nadu', daysMin: 1, daysMax: 2, express: true, couriers: ['Direct Transit Courier', 'Speed Post'] },
  { prefix: '625', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', zone: 'South Tamil Nadu', daysMin: 2, daysMax: 3, express: true, couriers: ['Bluedart', 'Speed Post'] },

  // Telangana & Andhra Pradesh
  { prefix: '500', city: 'Hyderabad / Secunderabad', district: 'Hyderabad', state: 'Telangana', zone: 'South-Central Metro', daysMin: 2, daysMax: 4, express: true, couriers: ['Bluedart Air', 'Delhivery'] },
  { prefix: '530', city: 'Visakhapatnam (Vizag)', district: 'Visakhapatnam', state: 'Andhra Pradesh', zone: 'Coastal Andhra', daysMin: 3, daysMax: 4, express: false, couriers: ['Speed Post', 'Delhivery'] },

  // Maharashtra & West
  { prefix: '400', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', zone: 'West Metro', daysMin: 3, daysMax: 4, express: true, couriers: ['Bluedart Air', 'Delhivery Prime'] },
  { prefix: '411', city: 'Pune', district: 'Pune', state: 'Maharashtra', zone: 'West Metro', daysMin: 3, daysMax: 4, express: true, couriers: ['Bluedart Air', 'Delhivery'] },
  { prefix: '380', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', zone: 'West Hub', daysMin: 3, daysMax: 5, express: false, couriers: ['Delhivery Express', 'Speed Post'] },

  // Delhi NCR & North
  { prefix: '110', city: 'New Delhi / NCR', district: 'New Delhi', state: 'Delhi', zone: 'North Capital Region', daysMin: 3, daysMax: 5, express: true, couriers: ['Bluedart Air', 'Delhivery Express'] },
  { prefix: '122', city: 'Gurugram (Gurgaon)', district: 'Gurugram', state: 'Haryana', zone: 'North Metro', daysMin: 3, daysMax: 5, express: true, couriers: ['Bluedart Air', 'Delhivery'] },
  { prefix: '201', city: 'Noida / Ghaziabad', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', zone: 'North Metro', daysMin: 3, daysMax: 5, express: true, couriers: ['Delhivery Express', 'Speed Post'] },
  { prefix: '160', city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', zone: 'North Region', daysMin: 4, daysMax: 5, express: false, couriers: ['Speed Post', 'Delhivery'] },

  // East & Other Metros
  { prefix: '700', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', zone: 'East Metro', daysMin: 4, daysMax: 5, express: false, couriers: ['Speed Post', 'Delhivery'] },
  { prefix: '751', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', zone: 'East Hub', daysMin: 4, daysMax: 5, express: false, couriers: ['Speed Post', 'Delhivery'] }
];

export function estimatePincodeDelivery(pincodeInput: string, cartSubtotal = 0): PincodeDeliveryEstimate {
  const cleanPin = pincodeInput.replace(/\D/g, '').slice(0, 6);

  if (cleanPin.length !== 6) {
    return {
      pincode: cleanPin,
      valid: false,
      city: '',
      state: '',
      zone: '',
      deliveryDaysMin: 0,
      deliveryDaysMax: 0,
      deliveryTimeframe: '',
      estimatedDeliveryDate: '',
      isExpress: false,
      codAvailable: false,
      freeShippingEligible: false,
      freeShippingThreshold: 499,
      standardShippingFee: 49,
      courierPartners: [],
      message: 'Please enter a valid 6-digit Indian postal PIN code.'
    };
  }

  // Find exact 3-digit prefix or generic 2-digit / 1-digit region
  const prefix3 = cleanPin.slice(0, 3);
  const prefix2 = cleanPin.slice(0, 2);
  const prefix1 = cleanPin.slice(0, 1);

  const matched = PINCODE_MAP.find((item) => item.prefix === prefix3) ||
    PINCODE_MAP.find((item) => item.prefix.length === 2 && item.prefix === prefix2);

  let city = 'Serviceable Location';
  let district = '';
  let state = 'India';
  let zone = 'National Delivery';
  let daysMin = 4;
  let daysMax = 6;
  let isExpress = false;
  let couriers = ['India Post Speed Post', 'Delhivery Surface'];

  if (matched) {
    city = matched.city;
    district = matched.district;
    state = matched.state;
    zone = matched.zone;
    daysMin = matched.daysMin;
    daysMax = matched.daysMax;
    isExpress = matched.express;
    couriers = matched.couriers;
  } else if (cleanPin.startsWith('67') || cleanPin.startsWith('68') || cleanPin.startsWith('69')) {
    city = 'Kerala Delivery Zone';
    state = 'Kerala';
    zone = 'Kerala Intra-State';
    daysMin = 1;
    daysMax = 2;
    isExpress = true;
    couriers = ['Kerala Speed Post', 'Delhivery Direct'];
  } else if (cleanPin.startsWith('56') || cleanPin.startsWith('57') || cleanPin.startsWith('58') || cleanPin.startsWith('59')) {
    city = 'Karnataka Delivery Zone';
    state = 'Karnataka';
    zone = 'South Region';
    daysMin = 2;
    daysMax = 4;
    isExpress = true;
    couriers = ['Bluedart Air', 'Delhivery Express'];
  } else if (cleanPin.startsWith('60') || cleanPin.startsWith('61') || cleanPin.startsWith('62') || cleanPin.startsWith('63') || cleanPin.startsWith('64')) {
    city = 'Tamil Nadu Delivery Zone';
    state = 'Tamil Nadu';
    zone = 'South Region';
    daysMin = 2;
    daysMax = 4;
    isExpress = true;
    couriers = ['Bluedart', 'Speed Post'];
  } else if (cleanPin.startsWith('50') || cleanPin.startsWith('51') || cleanPin.startsWith('52') || cleanPin.startsWith('53')) {
    city = 'Andhra / Telangana Zone';
    state = 'Telangana / AP';
    zone = 'South Central';
    daysMin = 3;
    daysMax = 4;
    isExpress = true;
    couriers = ['Delhivery Express', 'Speed Post'];
  } else if (cleanPin.startsWith('40') || cleanPin.startsWith('41') || cleanPin.startsWith('42') || cleanPin.startsWith('43') || cleanPin.startsWith('44')) {
    city = 'Maharashtra Zone';
    state = 'Maharashtra';
    zone = 'Western India';
    daysMin = 3;
    daysMax = 4;
    isExpress = true;
    couriers = ['Bluedart Air', 'Delhivery Express'];
  } else if (cleanPin.startsWith('11') || cleanPin.startsWith('12') || cleanPin.startsWith('13') || cleanPin.startsWith('20')) {
    city = 'North India / Delhi NCR';
    state = 'Delhi NCR / North';
    zone = 'Northern India';
    daysMin = 3;
    daysMax = 5;
    isExpress = true;
    couriers = ['Bluedart Air', 'Delhivery'];
  }

  // Calculate target date formatted
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysMax);

  const formattedDate = targetDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const isKozhikodeLocal = cleanPin.startsWith('673');
  const deliveryTimeframe = isKozhikodeLocal
    ? 'Same-Day or Next-Day (Within 24 Hours)'
    : daysMin === 1 && daysMax === 2
    ? '1 to 2 Days (Express Kerala Dispatch)'
    : `${daysMin} to ${daysMax} Business Days`;

  const freeShippingThreshold = 499;
  const isFreeShipping = cartSubtotal >= freeShippingThreshold;

  let message = `Delivering to ${city}, ${state} by ${formattedDate}.`;
  if (isKozhikodeLocal) {
    message = `⚡ Ultra-fast dispatch directly from our Kozhikode extraction mill!`;
  }

  return {
    pincode: cleanPin,
    valid: true,
    city,
    district,
    state,
    zone,
    deliveryDaysMin: daysMin,
    deliveryDaysMax: daysMax,
    deliveryTimeframe,
    estimatedDeliveryDate: formattedDate,
    isExpress,
    codAvailable: true,
    freeShippingEligible: isFreeShipping,
    freeShippingThreshold,
    standardShippingFee: 49,
    courierPartners: couriers,
    message
  };
}
