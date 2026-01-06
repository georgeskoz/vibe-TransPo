# QuébecTaxi - Taxi & Delivery App

A comprehensive taxi, courier, and food delivery app designed for Quebec with full compliance to MTQ (Ministère des Transports du Québec) 2026 regulations.

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
- **Dashboard**: Online/offline toggle, daily stats
- **Taxi Meter**:
  - Real-time fare calculation based on Quebec rates
  - Distance and waiting time tracking
  - Airport surcharge toggle
  - Complete fare breakdown with taxes
- **Earnings**: Weekly earnings chart, daily breakdown, payout info
- **Documents**: Permit, insurance, vehicle registration management

### Payment Integration
- Square payment integration ready
- Direct deposit setup for drivers
- Multiple payment methods support

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
│   ├── _layout.tsx          # Root navigation
│   ├── booking.tsx          # Ride booking
│   └── trip.tsx             # Trip tracking
├── lib/
│   ├── i18n.ts              # Translations
│   ├── quebec-taxi.ts       # Quebec rates & calculations
│   ├── store.ts             # App state (Zustand)
│   └── cn.ts                # Styling utilities
└── components/
```

## Quebec Tax Rates

| Tax | Rate |
|-----|------|
| GST (TPS) | 5% |
| QST (TVQ) | 9.975% |
| **Combined** | **14.975%** |

## Quebec Taxi Rates (2026)

| Service | Rate |
|---------|------|
| Base fare | $3.50 |
| Per kilometer | $1.90 |
| Waiting time (per minute) | $0.70 |
| Minimum fare | $7.00 |
| Airport surcharge | $17.50 |

## Mode Switching

The app supports two modes:
- **Rider Mode**: For passengers booking rides
- **Driver Mode**: For taxi drivers with access to taxi meter and earnings

Toggle between modes using the button in the top-right corner of the home screen.
