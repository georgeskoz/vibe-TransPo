# TransPo API Requirements

This document outlines all external APIs and services needed to fully implement the TransPo app.

---

## 1. Authentication & Communication

### Twilio (SMS/Voice)
**Purpose:** OTP verification, driver-passenger communication, AI call center

| Service | Use Case | Pricing |
|---------|----------|---------|
| Twilio Verify | SMS OTP codes | ~$0.05/verification |
| Twilio SMS | Trip notifications, receipts | ~$0.0079/SMS |
| Twilio Voice | Driver-passenger calls (masked) | ~$0.014/min |
| Twilio Programmable Voice | AI call center integration | ~$0.014/min |

**Required Credentials:**
- Account SID
- Auth Token
- Verify Service SID
- Phone Number(s)

**Setup:** https://console.twilio.com

---

### Google OAuth
**Purpose:** Social login with Google accounts

| Service | Use Case | Pricing |
|---------|----------|---------|
| Google Sign-In | User authentication | Free |

**Required Credentials:**
- OAuth 2.0 Client ID (iOS)
- OAuth 2.0 Client ID (Android)
- OAuth 2.0 Client ID (Web)

**Setup:** https://console.cloud.google.com/apis/credentials

---

### Apple Sign-In
**Purpose:** Social login for iOS users (required for App Store)

| Service | Use Case | Pricing |
|---------|----------|---------|
| Sign in with Apple | User authentication | Free |

**Required:** Apple Developer Account, App ID with Sign-In capability

**Setup:** https://developer.apple.com

---

## 2. Maps & Location

### Google Maps Platform
**Purpose:** Maps, routing, geocoding, places autocomplete

| Service | Use Case | Pricing |
|---------|----------|---------|
| Maps SDK for iOS/Android | In-app maps | $7/1000 loads |
| Directions API | Route calculation, ETA | $5/1000 requests |
| Geocoding API | Address to coordinates | $5/1000 requests |
| Places API | Address autocomplete | $2.83/1000 requests |
| Distance Matrix API | Fare estimation | $5/1000 elements |
| Roads API | Snap to road for GPS | $10/1000 requests |

**Required Credentials:**
- API Key (restricted by app)
- Enable billing

**Setup:** https://console.cloud.google.com/google/maps-apis

**Monthly Estimate:** $200 credit free, then ~$500-2000/month at scale

---

## 3. Payments

### Stripe
**Purpose:** Online payments, saved cards, payouts to drivers

| Service | Use Case | Pricing |
|---------|----------|---------|
| Stripe Payments | Card processing | 2.9% + $0.30/transaction |
| Stripe Connect | Driver payouts | $2/payout (instant) |
| Stripe Identity | Driver verification | $1.50/verification |
| Apple Pay/Google Pay | Mobile wallets | Same as card |

**Required Credentials:**
- Publishable Key
- Secret Key
- Webhook Signing Secret
- Connect Account ID (for payouts)

**Setup:** https://dashboard.stripe.com

---

### Square
**Purpose:** In-vehicle payments (tap, chip, swipe)

| Service | Use Case | Pricing |
|---------|----------|---------|
| Square Reader SDK | In-person payments | 2.6% + $0.10/transaction |
| Square Terminal | Hardware payment device | $299 device + fees |

**Required Credentials:**
- Application ID
- Access Token
- Location ID

**Setup:** https://developer.squareup.com

---

### Apple Pay / Google Pay
**Purpose:** One-tap mobile payments

| Requirements | Details |
|--------------|---------|
| Apple Pay | Apple Developer Account, Merchant ID |
| Google Pay | Google Pay API enabled, Merchant ID |

---

## 4. AI & Machine Learning

### OpenAI
**Purpose:** AI call center, customer support chatbot

| Service | Use Case | Pricing |
|---------|----------|---------|
| GPT-4 API | Phone order processing | $0.03/1K input, $0.06/1K output |
| Whisper API | Speech-to-text | $0.006/minute |
| TTS API | Text-to-speech responses | $0.015/1K characters |

**Required Credentials:**
- API Key
- Organization ID (optional)

**Setup:** https://platform.openai.com

---

### ElevenLabs (Alternative TTS)
**Purpose:** Natural-sounding voice for AI call center

| Service | Use Case | Pricing |
|---------|----------|---------|
| Text-to-Speech | AI voice responses | $0.30/1K characters |

**Setup:** https://elevenlabs.io

---

## 5. Push Notifications

### Expo Push Notifications
**Purpose:** Real-time alerts (ride requests, order updates)

| Service | Use Case | Pricing |
|---------|----------|---------|
| Expo Push | iOS/Android notifications | Free (included with Expo) |

**Required:** Expo project, push notification certificates

---

### Firebase Cloud Messaging (Alternative)
**Purpose:** Cross-platform push notifications

| Service | Use Case | Pricing |
|---------|----------|---------|
| FCM | Push notifications | Free |

**Required Credentials:**
- Firebase project
- google-services.json (Android)
- GoogleService-Info.plist (iOS)

**Setup:** https://console.firebase.google.com

---

## 6. Real-Time Communication

### Socket.io / WebSockets
**Purpose:** Live location tracking, real-time updates

| Service | Use Case | Self-Hosted |
|---------|----------|-------------|
| Socket.io | Driver location streaming | Backend server required |
| Driver ETA updates | Real-time fare updates | - |

**Alternative Managed Services:**
- Pusher (~$49/month)
- Ably (~$25/month)
- AWS AppSync (pay per use)

---

## 7. Analytics & Monitoring

### Firebase Analytics
**Purpose:** User behavior, app performance

| Service | Use Case | Pricing |
|---------|----------|---------|
| Analytics | Event tracking | Free |
| Crashlytics | Crash reporting | Free |
| Performance | App performance | Free |

**Setup:** https://console.firebase.google.com

---

### Sentry
**Purpose:** Error tracking, performance monitoring

| Service | Use Case | Pricing |
|---------|----------|---------|
| Error Tracking | Bug monitoring | Free tier / $26/month |

**Setup:** https://sentry.io

---

## 8. Storage & CDN

### AWS S3 / CloudFront
**Purpose:** Image storage (receipts, profile photos, POD)

| Service | Use Case | Pricing |
|---------|----------|---------|
| S3 | File storage | $0.023/GB |
| CloudFront | CDN delivery | $0.085/GB |

**Alternative:** Cloudinary (free tier available)

---

## 9. Background Services

### Background Location (Mobile)
**Purpose:** Driver location tracking when app is backgrounded

| Platform | Service |
|----------|---------|
| iOS | Background Modes: Location updates |
| Android | Foreground Service with location |

**Required:** Expo Location with background permissions

---

## 10. Weather API (for Courier Pricing)

### OpenWeather
**Purpose:** Dynamic pricing based on weather conditions

| Service | Use Case | Pricing |
|---------|----------|---------|
| Current Weather | Real-time conditions | Free (60 calls/min) |

**Required Credentials:**
- API Key

**Setup:** https://openweathermap.org/api

---

## Summary: Required API Keys

### Must Have (Core Functionality)
```env
# Authentication
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_PHONE_NUMBER=

# Maps
GOOGLE_MAPS_API_KEY=

# Payments
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Push Notifications (via Expo)
EXPO_ACCESS_TOKEN=
```

### Nice to Have (Enhanced Features)
```env
# AI Call Center
OPENAI_API_KEY=

# In-Vehicle Payments
SQUARE_APPLICATION_ID=
SQUARE_ACCESS_TOKEN=

# Weather-based Pricing
OPENWEATHER_API_KEY=

# Analytics
SENTRY_DSN=
FIREBASE_CONFIG=
```

---

## Estimated Monthly Costs

| Service | Low Usage | Medium Usage | High Usage |
|---------|-----------|--------------|------------|
| Twilio | $50 | $200 | $1,000 |
| Google Maps | $0 (free tier) | $300 | $2,000 |
| Stripe | 2.9% + $0.30 per transaction | - | - |
| Square | 2.6% + $0.10 per transaction | - | - |
| OpenAI | $20 | $100 | $500 |
| Hosting (Backend) | $50 | $200 | $1,000 |
| **Total** | ~$120 + fees | ~$800 + fees | ~$4,500 + fees |

---

## Setup Priority

### Phase 1 (MVP Launch)
1. Twilio (OTP verification)
2. Google Maps Platform
3. Stripe (payments)
4. Expo Push Notifications

### Phase 2 (Enhanced Features)
5. Square (in-vehicle payments)
6. OpenAI (AI call center)
7. Firebase Analytics
8. Sentry

### Phase 3 (Scale)
9. AWS S3/CloudFront
10. Background location services
11. Advanced analytics

---

## Vibecode Integration

Most of these APIs can be set up through the **API tab** in Vibecode:
- OpenAI text generation
- ElevenLabs voice generation

For others, you'll need to:
1. Sign up on each platform
2. Get API keys
3. Add them in the **ENV tab** in Vibecode
