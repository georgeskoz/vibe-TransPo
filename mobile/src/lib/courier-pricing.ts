// Advanced Courier Pricing Algorithm
// Implements dynamic pricing based on multiple factors

import { QUEBEC_TAXES } from './quebec-taxi';

export type DeliverySpeed = 'express' | 'priority' | 'standard' | 'shared';
export type PackageSize = 'small' | 'medium' | 'large';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'after_midnight';
export type WeatherCondition = 'clear' | 'rain' | 'snow' | 'extreme';

// Base rates
export const COURIER_BASE_RATES = {
  small: { base: 8.99, perKmAfter3: 1.50 },
  medium: { base: 14.99, perKmAfter3: 2.00 },
  large: { base: 24.99, perKmAfter3: 2.50 },
};

// Speed multipliers
export const SPEED_MULTIPLIERS: Record<DeliverySpeed, { multiplier: number; eta: string; etaFr: string }> = {
  express: { multiplier: 1.75, eta: '1-2 hours', etaFr: '1-2 heures' },
  priority: { multiplier: 1.35, eta: '2-4 hours', etaFr: '2-4 heures' },
  standard: { multiplier: 1.0, eta: 'Same day', etaFr: 'Même jour' },
  shared: { multiplier: 0.75, eta: 'Same day (flexible)', etaFr: 'Même jour (flexible)' },
};

// Time of day multipliers
export const TIME_MULTIPLIERS: Record<TimeOfDay, number> = {
  morning: 1.0,      // 6 AM - 12 PM
  afternoon: 1.0,    // 12 PM - 5 PM
  evening: 1.15,     // 5 PM - 9 PM
  night: 1.25,       // 9 PM - 12 AM
  after_midnight: 1.50, // 12 AM - 6 AM
};

// Weather condition surcharges
export const WEATHER_SURCHARGES: Record<WeatherCondition, number> = {
  clear: 0,
  rain: 2.99,
  snow: 4.99,
  extreme: 9.99, // Blizzard, ice storm, etc.
};

// Shared delivery discount tiers
export const SHARED_DELIVERY_DISCOUNTS = {
  // If package can share with 1 other delivery on route
  twoWay: 0.15, // 15% discount
  // If package can share with 2+ deliveries
  multiWay: 0.25, // 25% discount
};

// Fragile handling fee
export const FRAGILE_FEE = 2.99;

// Special handling fees
export const SPECIAL_HANDLING = {
  signature_required: 1.99,
  photo_proof: 0, // Included
  insurance_basic: 2.99, // Up to $100
  insurance_premium: 7.99, // Up to $500
  insurance_full: 14.99, // Up to $2000
};

// Distance thresholds
export const DISTANCE_THRESHOLDS = {
  freeKm: 3, // First 3km included in base
  longDistance: 15, // Over 15km gets 10% discount on per-km rate
  veryLongDistance: 30, // Over 30km gets 20% discount on per-km rate
};

interface PricingInput {
  packageSize: PackageSize;
  distanceKm: number;
  deliverySpeed: DeliverySpeed;
  isFragile: boolean;
  timeOfDay?: TimeOfDay;
  weather?: WeatherCondition;
  signatureRequired?: boolean;
  insuranceLevel?: 'none' | 'basic' | 'premium' | 'full';
  // For shared delivery calculation
  canShareRoute?: boolean;
  potentialSharePartners?: number; // 0, 1, or 2+
}

export interface CourierPriceBreakdown {
  basePrice: number;
  distancePrice: number;
  speedSurcharge: number;
  timeSurcharge: number;
  weatherSurcharge: number;
  fragileFee: number;
  signatureFee: number;
  insuranceFee: number;
  sharedDiscount: number;
  subtotal: number;
  gst: number;
  qst: number;
  totalTaxes: number;
  total: number;
  estimatedDelivery: string;
  estimatedDeliveryFr: string;
  savings: number; // Amount saved with discounts
}

export function calculateCourierPrice(input: PricingInput): CourierPriceBreakdown {
  const {
    packageSize,
    distanceKm,
    deliverySpeed,
    isFragile,
    timeOfDay = 'afternoon',
    weather = 'clear',
    signatureRequired = false,
    insuranceLevel = 'none',
    canShareRoute = false,
    potentialSharePartners = 0,
  } = input;

  const rates = COURIER_BASE_RATES[packageSize];
  const speedData = SPEED_MULTIPLIERS[deliverySpeed];

  // 1. Base price
  const basePrice = rates.base;

  // 2. Distance price (after first 3km)
  let distancePrice = 0;
  if (distanceKm > DISTANCE_THRESHOLDS.freeKm) {
    const chargeableKm = distanceKm - DISTANCE_THRESHOLDS.freeKm;
    let perKmRate = rates.perKmAfter3;

    // Apply long distance discounts
    if (distanceKm > DISTANCE_THRESHOLDS.veryLongDistance) {
      perKmRate *= 0.8; // 20% discount
    } else if (distanceKm > DISTANCE_THRESHOLDS.longDistance) {
      perKmRate *= 0.9; // 10% discount
    }

    distancePrice = chargeableKm * perKmRate;
  }

  // 3. Speed surcharge/discount
  const baseSubtotal = basePrice + distancePrice;
  const speedSurcharge = baseSubtotal * (speedData.multiplier - 1);

  // 4. Time of day surcharge
  const timeMultiplier = TIME_MULTIPLIERS[timeOfDay];
  const timeSurcharge = (baseSubtotal + speedSurcharge) * (timeMultiplier - 1);

  // 5. Weather surcharge
  const weatherSurcharge = WEATHER_SURCHARGES[weather];

  // 6. Fragile handling
  const fragileFee = isFragile ? FRAGILE_FEE : 0;

  // 7. Signature fee
  const signatureFee = signatureRequired ? SPECIAL_HANDLING.signature_required : 0;

  // 8. Insurance fee
  let insuranceFee = 0;
  if (insuranceLevel === 'basic') insuranceFee = SPECIAL_HANDLING.insurance_basic;
  else if (insuranceLevel === 'premium') insuranceFee = SPECIAL_HANDLING.insurance_premium;
  else if (insuranceLevel === 'full') insuranceFee = SPECIAL_HANDLING.insurance_full;

  // 9. Calculate subtotal before shared discount
  const subtotalBeforeShared = basePrice + distancePrice + speedSurcharge + timeSurcharge +
    weatherSurcharge + fragileFee + signatureFee + insuranceFee;

  // 10. Shared delivery discount (only for standard/shared speeds)
  let sharedDiscount = 0;
  if (canShareRoute && (deliverySpeed === 'standard' || deliverySpeed === 'shared')) {
    if (potentialSharePartners >= 2) {
      sharedDiscount = subtotalBeforeShared * SHARED_DELIVERY_DISCOUNTS.multiWay;
    } else if (potentialSharePartners >= 1) {
      sharedDiscount = subtotalBeforeShared * SHARED_DELIVERY_DISCOUNTS.twoWay;
    }
  }

  // 11. Final subtotal
  const subtotal = Math.max(subtotalBeforeShared - sharedDiscount, rates.base * 0.5); // Min 50% of base

  // 12. Calculate taxes
  const gst = subtotal * QUEBEC_TAXES.GST;
  const qst = subtotal * QUEBEC_TAXES.QST;
  const totalTaxes = gst + qst;

  // 13. Total
  const total = subtotal + totalTaxes;

  // Calculate savings
  const fullPriceSubtotal = basePrice + distancePrice +
    (basePrice + distancePrice) * (SPEED_MULTIPLIERS.express.multiplier - 1);
  const savings = Math.max(0, fullPriceSubtotal - subtotal + sharedDiscount);

  return {
    basePrice: roundToTwo(basePrice),
    distancePrice: roundToTwo(distancePrice),
    speedSurcharge: roundToTwo(speedSurcharge),
    timeSurcharge: roundToTwo(timeSurcharge),
    weatherSurcharge: roundToTwo(weatherSurcharge),
    fragileFee: roundToTwo(fragileFee),
    signatureFee: roundToTwo(signatureFee),
    insuranceFee: roundToTwo(insuranceFee),
    sharedDiscount: roundToTwo(sharedDiscount),
    subtotal: roundToTwo(subtotal),
    gst: roundToTwo(gst),
    qst: roundToTwo(qst),
    totalTaxes: roundToTwo(totalTaxes),
    total: roundToTwo(total),
    estimatedDelivery: speedData.eta,
    estimatedDeliveryFr: speedData.etaFr,
    savings: roundToTwo(savings),
  };
}

// Get current time of day
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) return 'after_midnight';
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Simulate weather (in production, use weather API)
export function getSimulatedWeather(): WeatherCondition {
  const random = Math.random();
  if (random < 0.7) return 'clear';
  if (random < 0.85) return 'rain';
  if (random < 0.95) return 'snow';
  return 'extreme';
}

// Check if shared delivery is available (simplified)
export function checkSharedDeliveryAvailability(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): { available: boolean; partners: number; savingsPercent: number } {
  // In production, this would query the backend for nearby deliveries
  // For demo, simulate based on location
  const random = Math.random();

  if (random < 0.3) {
    return { available: true, partners: 2, savingsPercent: 25 };
  } else if (random < 0.6) {
    return { available: true, partners: 1, savingsPercent: 15 };
  }

  return { available: false, partners: 0, savingsPercent: 0 };
}

// Format price display
export function formatCourierPrice(price: CourierPriceBreakdown, language: 'fr' | 'en'): string {
  const amount = price.total.toFixed(2);
  return language === 'fr' ? `${amount.replace('.', ',')} $` : `$${amount}`;
}

// Helper
function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}

// Generate price quote for display
export function generatePriceQuote(input: PricingInput, language: 'fr' | 'en') {
  const price = calculateCourierPrice(input);

  return {
    price,
    summary: {
      total: formatCourierPrice(price, language),
      eta: language === 'fr' ? price.estimatedDeliveryFr : price.estimatedDelivery,
      hasSavings: price.savings > 0,
      savingsAmount: language === 'fr'
        ? `${price.savings.toFixed(2).replace('.', ',')} $`
        : `$${price.savings.toFixed(2)}`,
      sharedDeliveryAvailable: price.sharedDiscount > 0,
    },
  };
}
