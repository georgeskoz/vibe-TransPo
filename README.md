# TransPo (QuébecTaxi) - Taxi & Delivery App

A comprehensive taxi, courier, and food delivery app designed for Quebec with full compliance to MTQ (Ministère des Transports du Québec) 2026 regulations.

**Last Updated:** January 2026

---

## Implementation Status

### Phase 1: User App MVP

#### Authentication System
- [x] Phone/Email login screens
- [x] OTP verification flow
- [x] Google OAuth integration (UI ready)
- [x] JWT token management
- [x] Session persistence across app restarts
- [x] Logout clears sensitive data

#### Taxi Service
- [x] Location picker with saved places
- [x] Fare calculation (accurate to Quebec rates)
- [x] Ride type selection (Standard, Premium, Accessible, XL)
- [x] Taxi meter with live updates every 5 seconds
- [x] Trip history with fare breakdown
- [ ] Real-time driver location (Socket.io) - Backend needed
- [ ] Stripe payment processing - API integration needed

#### Food Delivery
- [x] Restaurant browsing with categories
- [x] Menu items display with images
- [x] Cart management (add, remove, quantity)
- [x] Checkout with delivery address
- [x] Order tracking UI
- [ ] Live delivery driver location - Backend needed

#### Courier Service
- [x] Package size/fragility selection
- [x] Dynamic price calculation algorithm
- [x] Shared delivery discount (up to 25%)
- [x] Time of day pricing
- [x] Weather condition surcharges
- [x] QR Code & address label generation
- [x] Proof of delivery with photo capture
- [ ] Live shipment tracking - Backend needed

#### Billing & Compliance
- [x] Quebec GST (5%) applied correctly
- [x] Quebec QST (9.975%) applied correctly
- [x] Tax calculations verified for accuracy
- [x] Receipts show itemized breakdown
- [x] All currency formatted in CAD

#### Bilingual Support
- [x] Language toggle working (FR/EN)
- [x] All screens translated
- [x] Numbers/dates formatted by locale
- [x] French translations reviewed

### Phase 2: Driver App

- [x] Driver dashboard with stats
- [x] Online/offline toggle
- [x] Ride acceptance/rejection flow
- [x] Incoming ride request modal with timer
- [x] Earnings summary with weekly chart
- [x] Driver ratings display
- [x] Taxi meter (MTQ compliant)
- [x] Driver onboarding screens (documents, vehicle, insurance)
- [ ] Live location broadcasting - Socket.io needed

### Phase 3: UI/UX Components

- [x] Loading spinners and skeleton loaders
- [x] Toast notifications (success, error, warning, info)
- [x] Error states and empty states
- [x] Network error banner
- [x] Receipt generation with itemized breakdown (bilingual)
- [x] Support chat UI with quick actions

---

## Features

### Bilingual Support (French/English)
- Complete French and English translations
- Language toggle accessible from profile settings
- French Canadian currency formatting

### Quebec Taxi Regulations (MTQ 2026)
- Official Quebec taxi rates:
  - Base fare: $3.50
  - Per km: $1.90
  - Waiting time: $0.70/min (when speed < 20 km/h)
  - Minimum fare: $7.00
  - Airport surcharge: $17.50
- GST (TPS) 5% and QST (TVQ) 9.975% tax calculations
- Driver permit verification (Class 4C)

### User Features (Rider Mode)
- **Home Screen**: Service selection (Taxi, Courier, Food), promotions, recent places
- **Booking Flow**: Destination search, ride type selection (Standard, Premium, Accessible, XL)
- **Trip Tracking**: Real-time driver location, ETA, driver info
- **Activity**: Trip history with fare breakdown
- **Profile**: Account management, saved addresses, language settings

### Driver Features (Driver Mode)
- **Dashboard**: Online/offline toggle, daily stats, scheduled rides
- **Taxi Meter**:
  - Real-time fare calculation based on Quebec rates
  - Distance and waiting time tracking
  - Airport surcharge toggle
  - Complete fare breakdown with taxes
- **Earnings**: Weekly earnings chart, daily breakdown, payout info
- **Documents**: Permit, insurance, vehicle registration management

### Courier Service Features
- **Package Sizes**: Small, Medium, Large with different pricing
- **Delivery Speeds**: Express (1-2h), Priority (2-4h), Standard (same day), Shared
- **Shared Delivery**: Save up to 25% by sharing routes with other deliveries
- **Dynamic Pricing**: Time of day, weather conditions, distance
- **QR Code Labels**: Generate and print shipping labels
- **Proof of Delivery**: Photo capture with GPS location

### Payment Integration
- Square payment integration ready (for in-vehicle payments)
- Direct deposit setup for drivers
- Multiple payment methods support

---

## App Structure

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab navigation
│   │   ├── index.tsx        # Home (Rider/Driver)
│   │   ├── activity.tsx     # Trip history
│   │   ├── meter.tsx        # Taxi meter (Driver)
│   │   ├── earnings.tsx     # Earnings (Driver)
│   │   └── profile.tsx      # User profile
│   ├── auth/
│   │   ├── login.tsx        # Login screen
│   │   ├── register.tsx     # Registration
│   │   └── verify-otp.tsx   # OTP verification
│   ├── _layout.tsx          # Root navigation
│   ├── booking.tsx          # Taxi ride booking
│   ├── courier.tsx          # Courier/package delivery
│   ├── food.tsx             # Food delivery & restaurants
│   ├── trip.tsx             # Trip tracking
│   ├── driver-dashboard.tsx # Driver dashboard
│   ├── driver-onboarding.tsx # Driver registration (5-step)
│   └── support.tsx          # Support chat
├── lib/
│   ├── auth-store.ts        # Authentication state
│   ├── courier-pricing.ts   # Dynamic courier pricing algorithm
│   ├── i18n.ts              # Translations
│   ├── quebec-taxi.ts       # Quebec rates & calculations
│   ├── store.ts             # App state (Zustand)
│   └── cn.ts                # Styling utilities
└── components/
    ├── LoadingSpinner.tsx   # Loading states & skeletons
    ├── Toast.tsx            # Toast notifications
    ├── ErrorState.tsx       # Error & empty states
    ├── Receipt.tsx          # Itemized receipt display
    ├── ProofOfDelivery.tsx  # Camera capture for POD
    └── ShipmentLabel.tsx    # QR code & label generation
```

---

## Quebec Tax Rates

| Tax | Rate |
|-----|------|
| GST (TPS) | 5% |
| QST (TVQ) | 9.975% |
| **Combined** | **14.975%** |

**Note:** GST and QST are calculated separately on the subtotal (not compounded).

## Quebec Taxi Rates (2026)

### Day Rate (Tarif A) - 5:00 AM to 11:00 PM

| Service | Rate |
|---------|------|
| Base fare | $3.50 |
| Per kilometer | $1.90 |
| Waiting time (per minute) | $0.70 |
| Minimum fare | $7.00 |

### Night Rate (Tarif B) - 11:00 PM to 5:00 AM

| Service | Rate |
|---------|------|
| Base fare | $3.90 |
| Per kilometer | $2.10 |
| Waiting time (per minute) | $0.75 |
| Minimum fare | $7.80 |

### Additional Fees (Both Rates)

| Service | Rate |
|---------|------|
| Airport surcharge | $17.50 |
| **Regulatory fee** | **$0.90** |

**Note:** The $0.90 regulatory fee is mandatory since Jan 1, 2021 and must be shown separately on receipts.

## Courier Pricing Algorithm

| Factor | Impact |
|--------|--------|
| Express delivery | +75% |
| Priority delivery | +35% |
| Shared delivery | -15% to -25% |
| Evening hours (5-9 PM) | +15% |
| Night hours (9 PM-12 AM) | +25% |
| After midnight | +50% |
| Rain | +$2.99 |
| Snow | +$4.99 |
| Fragile handling | +$2.99 |

---

## Mode Switching

The app supports two modes:
- **Rider Mode**: For passengers booking rides
- **Driver Mode**: For taxi drivers with access to taxi meter and earnings

Toggle between modes using the button in the top-right corner of the home screen.

---

## Backend Requirements

To complete the app, the following backend services are needed:

1. **Authentication API**: JWT token generation, OTP via Twilio
2. **Real-time Service**: Socket.io for live location tracking
3. **Payment Processing**: Stripe API integration
4. **Database**: PostgreSQL/MongoDB for user, trip, and order data
5. **Maps**: Google Maps API for routing and geocoding
