// Quebec Taxi Regulations 2026 - MTQ Compliant
// Based on Ministère des Transports du Québec regulations

// Quebec tax rates
export const QUEBEC_TAXES = {
  GST: 0.05, // Federal goods and services tax (TPS)
  QST: 0.09975, // Quebec sales tax (TVQ)
  TOTAL_TAX_RATE: 0.14975, // Combined rate
};

// Quebec taxi rates 2026 (MTQ regulated)
// These rates are set by the Commission des transports du Québec
// Rate A: Day rate (5:00 AM - 11:00 PM)
// Rate B: Night rate (11:00 PM - 5:00 AM)
export const QUEBEC_TAXI_RATES = {
  // Day Rate (Tarif A) - 5:00 AM to 11:00 PM
  DAY: {
    BASE_FARE: 3.50,        // Prise en charge
    PER_KM: 1.90,           // Par kilomètre
    PER_MINUTE_WAITING: 0.70, // Attente par minute
    MINIMUM_FARE: 7.00,     // Tarif minimum
  },

  // Night Rate (Tarif B) - 11:00 PM to 5:00 AM
  NIGHT: {
    BASE_FARE: 3.90,        // Prise en charge (majoré)
    PER_KM: 2.10,           // Par kilomètre (majoré)
    PER_MINUTE_WAITING: 0.75, // Attente par minute (majoré)
    MINIMUM_FARE: 7.80,     // Tarif minimum (majoré)
  },

  // Airport surcharge (supplément aéroport) - same for both rates
  AIRPORT_SURCHARGE: 17.50,

  // Regulatory fee (frais réglementaires) - Required since Jan 1, 2021
  // Must be shown separately on receipt
  REGULATORY_FEE: 0.90,

  // Speed threshold for waiting time (km/h)
  WAITING_SPEED_THRESHOLD: 20,

  // Time boundaries for rate determination
  DAY_START_HOUR: 5,    // 5:00 AM
  NIGHT_START_HOUR: 23, // 11:00 PM
};

// Determine if current time falls under night rate
export function isNightRate(date: Date = new Date()): boolean {
  const hour = date.getHours();
  // Night rate: 11:00 PM (23) to 5:00 AM (5)
  return hour >= QUEBEC_TAXI_RATES.NIGHT_START_HOUR || hour < QUEBEC_TAXI_RATES.DAY_START_HOUR;
}

// Get current rate based on time
export function getCurrentRates(date: Date = new Date()) {
  return isNightRate(date) ? QUEBEC_TAXI_RATES.NIGHT : QUEBEC_TAXI_RATES.DAY;
}

// Calculate taxi fare based on Quebec regulations
export interface TripData {
  distanceKm: number;
  durationMinutes: number;
  waitingMinutes: number;
  isAirport: boolean;
  tripStartTime?: Date; // Optional: defaults to current time
}

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  waitingFare: number;
  airportSurcharge: number;
  regulatoryFee: number; // $0.90 mandatory fee since Jan 1, 2021
  subtotal: number;
  gst: number;
  qst: number;
  totalTaxes: number;
  total: number;
  isNightRate: boolean; // Indicates which rate was applied
}

export function calculateFare(trip: TripData): FareBreakdown {
  const { distanceKm, waitingMinutes, isAirport, tripStartTime } = trip;

  // Determine which rate to use based on trip start time
  const tripTime = tripStartTime ?? new Date();
  const nightRate = isNightRate(tripTime);
  const rates = getCurrentRates(tripTime);

  // Base fare
  const baseFare = rates.BASE_FARE;

  // Distance fare
  const distanceFare = distanceKm * rates.PER_KM;

  // Waiting time fare
  const waitingFare = waitingMinutes * rates.PER_MINUTE_WAITING;

  // Airport surcharge
  const airportSurcharge = isAirport ? QUEBEC_TAXI_RATES.AIRPORT_SURCHARGE : 0;

  // Regulatory fee - mandatory $0.90 since Jan 1, 2021
  const regulatoryFee = QUEBEC_TAXI_RATES.REGULATORY_FEE;

  // Calculate subtotal (before taxes, excluding regulatory fee which is not taxed)
  let fareSubtotal = baseFare + distanceFare + waitingFare + airportSurcharge;

  // Apply minimum fare (before regulatory fee)
  fareSubtotal = Math.max(fareSubtotal, rates.MINIMUM_FARE);

  // Calculate taxes on fare subtotal only (regulatory fee is not taxed)
  // Note: GST and QST are calculated separately, not compounded
  const gst = fareSubtotal * QUEBEC_TAXES.GST;
  const qst = fareSubtotal * QUEBEC_TAXES.QST;
  const totalTaxes = gst + qst;

  // Subtotal includes fare + regulatory fee (before taxes shown)
  const subtotal = fareSubtotal + regulatoryFee;

  // Total = fare + regulatory fee + taxes
  const total = fareSubtotal + regulatoryFee + totalTaxes;

  return {
    baseFare: roundToTwoDecimals(baseFare),
    distanceFare: roundToTwoDecimals(distanceFare),
    waitingFare: roundToTwoDecimals(waitingFare),
    airportSurcharge: roundToTwoDecimals(airportSurcharge),
    regulatoryFee: roundToTwoDecimals(regulatoryFee),
    subtotal: roundToTwoDecimals(subtotal),
    gst: roundToTwoDecimals(gst),
    qst: roundToTwoDecimals(qst),
    totalTaxes: roundToTwoDecimals(totalTaxes),
    total: roundToTwoDecimals(total),
    isNightRate: nightRate,
  };
}

// Estimate fare for a trip
export function estimateFare(distanceKm: number, estimatedMinutes: number): FareBreakdown {
  // Estimate waiting time as 10% of trip duration (traffic lights, etc.)
  const estimatedWaitingMinutes = estimatedMinutes * 0.1;

  return calculateFare({
    distanceKm,
    durationMinutes: estimatedMinutes,
    waitingMinutes: estimatedWaitingMinutes,
    isAirport: false,
  });
}

// Format currency for Quebec (French Canadian format)
export function formatCurrency(amount: number, language: 'fr' | 'en'): string {
  if (language === 'fr') {
    // French Canadian format: 10,50 $
    return `${amount.toFixed(2).replace('.', ',')} $`;
  }
  // English format: $10.50
  return `$${amount.toFixed(2)}`;
}

// Format distance
export function formatDistance(km: number, language: 'fr' | 'en'): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  const formatted = km.toFixed(1);
  return language === 'fr'
    ? `${formatted.replace('.', ',')} km`
    : `${formatted} km`;
}

// Format duration
export function formatDuration(minutes: number, language: 'fr' | 'en'): string {
  if (minutes < 1) {
    return language === 'fr' ? '< 1 min' : '< 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (language === 'fr') {
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Helper function
function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

// MTQ Driver requirements 2026
export const MTQ_REQUIREMENTS = {
  // Valid Quebec Class 5 driver's license for at least 12 months
  minLicenseMonths: 12,

  // Valid taxi driver permit (4C)
  permitClass: '4C',

  // Criminal background check required
  backgroundCheckRequired: true,

  // Vehicle age limit (years)
  maxVehicleAge: 10,

  // Annual mechanical inspection required
  annualInspectionRequired: true,

  // Insurance minimum coverage
  minInsuranceCoverage: 1000000, // $1,000,000 CAD

  // Receipt required for all trips
  receiptRequired: true,

  // Electronic meter required
  electronicMeterRequired: true,
};

// Receipt data structure (as required by MTQ)
export interface TaxiReceipt {
  receiptNumber: string;
  date: Date;
  driverName: string;
  driverPermitNumber: string;
  vehiclePlate: string;
  companyName?: string;
  pickupAddress: string;
  dropoffAddress: string;
  trip: TripData;
  fare: FareBreakdown;
  paymentMethod: 'cash' | 'card';
  gstNumber?: string;
  qstNumber?: string;
}

// Generate receipt number
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QC-${timestamp}-${random}`;
}

// Delivery service rates
export const DELIVERY_RATES = {
  // Base delivery fee
  BASE_FEE: 4.99,

  // Per km after first 3km
  PER_KM_AFTER_3: 1.50,

  // Free delivery threshold (order value)
  FREE_DELIVERY_THRESHOLD: 35.00,

  // Courier package sizes
  PACKAGE_SIZES: {
    small: { maxWeight: 5, maxDimension: 30, baseFee: 8.99 },
    medium: { maxWeight: 15, maxDimension: 60, baseFee: 14.99 },
    large: { maxWeight: 30, maxDimension: 100, baseFee: 24.99 },
  } as const,
};

export function calculateDeliveryFee(
  distanceKm: number,
  orderValue: number,
  isCourier: boolean,
  packageSize?: 'small' | 'medium' | 'large'
): FareBreakdown {
  let subtotal: number;

  if (isCourier && packageSize) {
    // Courier pricing
    subtotal = DELIVERY_RATES.PACKAGE_SIZES[packageSize].baseFee;
    if (distanceKm > 3) {
      subtotal += (distanceKm - 3) * DELIVERY_RATES.PER_KM_AFTER_3;
    }
  } else {
    // Food delivery pricing
    if (orderValue >= DELIVERY_RATES.FREE_DELIVERY_THRESHOLD) {
      subtotal = 0;
    } else {
      subtotal = DELIVERY_RATES.BASE_FEE;
      if (distanceKm > 3) {
        subtotal += (distanceKm - 3) * DELIVERY_RATES.PER_KM_AFTER_3;
      }
    }
  }

  const gst = subtotal * QUEBEC_TAXES.GST;
  const qst = subtotal * QUEBEC_TAXES.QST;
  const totalTaxes = gst + qst;
  const total = subtotal + totalTaxes;

  return {
    baseFare: roundToTwoDecimals(subtotal),
    distanceFare: 0,
    waitingFare: 0,
    airportSurcharge: 0,
    regulatoryFee: 0, // No regulatory fee for delivery services
    subtotal: roundToTwoDecimals(subtotal),
    gst: roundToTwoDecimals(gst),
    qst: roundToTwoDecimals(qst),
    totalTaxes: roundToTwoDecimals(totalTaxes),
    total: roundToTwoDecimals(total),
    isNightRate: false, // Not applicable for delivery
  };
}
