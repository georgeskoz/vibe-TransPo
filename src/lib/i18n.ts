import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en';

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

export const useI18n = create<I18nStore>((set) => ({
  language: 'fr', // Default to French for Quebec
  setLanguage: async (lang) => {
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
  },
  loadLanguage: async () => {
    const saved = await AsyncStorage.getItem('app_language');
    if (saved === 'fr' || saved === 'en') {
      set({ language: saved });
    }
  },
}));

// Translation dictionary
export const translations = {
  // Common
  home: { fr: 'Accueil', en: 'Home' },
  profile: { fr: 'Profil', en: 'Profile' },
  settings: { fr: 'Paramètres', en: 'Settings' },
  activity: { fr: 'Activité', en: 'Activity' },
  earnings: { fr: 'Revenus', en: 'Earnings' },
  language: { fr: 'Langue', en: 'Language' },
  french: { fr: 'Français', en: 'French' },
  english: { fr: 'Anglais', en: 'English' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
  confirm: { fr: 'Confirmer', en: 'Confirm' },
  save: { fr: 'Sauvegarder', en: 'Save' },
  back: { fr: 'Retour', en: 'Back' },
  next: { fr: 'Suivant', en: 'Next' },
  loading: { fr: 'Chargement...', en: 'Loading...' },
  error: { fr: 'Erreur', en: 'Error' },
  success: { fr: 'Succès', en: 'Success' },

  // App specific
  appName: { fr: 'QuébecTaxi', en: 'QuébecTaxi' },
  whereToGo: { fr: 'Où allez-vous?', en: 'Where are you going?' },
  pickupLocation: { fr: 'Point de départ', en: 'Pickup location' },
  destination: { fr: 'Destination', en: 'Destination' },
  currentLocation: { fr: 'Position actuelle', en: 'Current location' },

  // Taxi meter
  taxiMeter: { fr: 'Taximètre', en: 'Taxi Meter' },
  startTrip: { fr: 'Démarrer la course', en: 'Start Trip' },
  endTrip: { fr: 'Terminer la course', en: 'End Trip' },
  pauseTrip: { fr: 'Pause', en: 'Pause' },
  resumeTrip: { fr: 'Reprendre', en: 'Resume' },
  tripInProgress: { fr: 'Course en cours', en: 'Trip in progress' },
  waitingTime: { fr: 'Temps d\'attente', en: 'Waiting time' },
  distance: { fr: 'Distance', en: 'Distance' },
  duration: { fr: 'Durée', en: 'Duration' },
  fare: { fr: 'Tarif', en: 'Fare' },
  baseFare: { fr: 'Tarif de base', en: 'Base fare' },
  distanceFare: { fr: 'Tarif distance', en: 'Distance fare' },
  timeFare: { fr: 'Tarif temps', en: 'Time fare' },
  subtotal: { fr: 'Sous-total', en: 'Subtotal' },
  total: { fr: 'Total', en: 'Total' },

  // Quebec taxes
  gst: { fr: 'TPS (5%)', en: 'GST (5%)' },
  qst: { fr: 'TVQ (9.975%)', en: 'QST (9.975%)' },
  taxes: { fr: 'Taxes', en: 'Taxes' },

  // Quebec regulations
  quebecRegulations: { fr: 'Réglementations du Québec', en: 'Quebec Regulations' },
  mtqCompliant: { fr: 'Conforme MTQ 2026', en: 'MTQ 2026 Compliant' },
  permitNumber: { fr: 'Numéro de permis', en: 'Permit number' },
  vehicleInfo: { fr: 'Info véhicule', en: 'Vehicle info' },

  // Services
  taxi: { fr: 'Taxi', en: 'Taxi' },
  courier: { fr: 'Coursier', en: 'Courier' },
  food: { fr: 'Repas', en: 'Food' },
  foodDelivery: { fr: 'Livraison repas', en: 'Food Delivery' },
  selectService: { fr: 'Choisir un service', en: 'Select a service' },

  // Ride types
  standard: { fr: 'Standard', en: 'Standard' },
  premium: { fr: 'Premium', en: 'Premium' },
  accessible: { fr: 'Accessible', en: 'Accessible' },
  xl: { fr: 'XL (6+)', en: 'XL (6+)' },

  // Booking
  bookRide: { fr: 'Réserver', en: 'Book Ride' },
  findingDriver: { fr: 'Recherche d\'un chauffeur...', en: 'Finding a driver...' },
  driverFound: { fr: 'Chauffeur trouvé!', en: 'Driver found!' },
  driverArriving: { fr: 'Le chauffeur arrive', en: 'Driver is arriving' },
  estimatedArrival: { fr: 'Arrivée estimée', en: 'Estimated arrival' },
  estimatedFare: { fr: 'Tarif estimé', en: 'Estimated fare' },

  // Driver
  goOnline: { fr: 'Se connecter', en: 'Go Online' },
  goOffline: { fr: 'Se déconnecter', en: 'Go Offline' },
  online: { fr: 'En ligne', en: 'Online' },
  offline: { fr: 'Hors ligne', en: 'Offline' },
  newRideRequest: { fr: 'Nouvelle demande', en: 'New ride request' },
  acceptRide: { fr: 'Accepter', en: 'Accept' },
  declineRide: { fr: 'Refuser', en: 'Decline' },
  arrivedAtPickup: { fr: 'Arrivé au point de départ', en: 'Arrived at pickup' },
  startRide: { fr: 'Démarrer la course', en: 'Start ride' },
  completeRide: { fr: 'Terminer la course', en: 'Complete ride' },

  // Payments
  payment: { fr: 'Paiement', en: 'Payment' },
  paymentMethod: { fr: 'Mode de paiement', en: 'Payment method' },
  cash: { fr: 'Comptant', en: 'Cash' },
  card: { fr: 'Carte', en: 'Card' },
  squarePayment: { fr: 'Paiement Square', en: 'Square Payment' },
  directDeposit: { fr: 'Dépôt direct', en: 'Direct Deposit' },
  weeklyEarnings: { fr: 'Revenus de la semaine', en: 'Weekly earnings' },
  pendingPayout: { fr: 'Paiement en attente', en: 'Pending payout' },

  // Trip history
  tripHistory: { fr: 'Historique des courses', en: 'Trip history' },
  noTrips: { fr: 'Aucune course', en: 'No trips yet' },
  viewDetails: { fr: 'Voir les détails', en: 'View details' },

  // Ratings
  rateYourTrip: { fr: 'Évaluez votre course', en: 'Rate your trip' },
  rateDriver: { fr: 'Évaluer le chauffeur', en: 'Rate the driver' },
  ratePassenger: { fr: 'Évaluer le passager', en: 'Rate the passenger' },
  addTip: { fr: 'Ajouter un pourboire', en: 'Add a tip' },
  noTip: { fr: 'Pas de pourboire', en: 'No tip' },

  // Account
  personalInfo: { fr: 'Informations personnelles', en: 'Personal information' },
  paymentMethods: { fr: 'Modes de paiement', en: 'Payment methods' },
  documents: { fr: 'Documents', en: 'Documents' },
  driverLicense: { fr: 'Permis de conduire', en: 'Driver license' },
  taxiPermit: { fr: 'Permis de taxi', en: 'Taxi permit' },
  insurance: { fr: 'Assurance', en: 'Insurance' },
  vehicleRegistration: { fr: 'Immatriculation', en: 'Vehicle registration' },
  logout: { fr: 'Déconnexion', en: 'Logout' },

  // Food delivery
  restaurants: { fr: 'Restaurants', en: 'Restaurants' },
  orderFood: { fr: 'Commander', en: 'Order Food' },
  deliveryAddress: { fr: 'Adresse de livraison', en: 'Delivery address' },
  deliveryFee: { fr: 'Frais de livraison', en: 'Delivery fee' },
  orderStatus: { fr: 'Statut de la commande', en: 'Order status' },
  preparing: { fr: 'En préparation', en: 'Preparing' },
  onTheWay: { fr: 'En route', en: 'On the way' },
  delivered: { fr: 'Livré', en: 'Delivered' },

  // Courier
  sendPackage: { fr: 'Envoyer un colis', en: 'Send a package' },
  packageSize: { fr: 'Taille du colis', en: 'Package size' },
  small: { fr: 'Petit', en: 'Small' },
  medium: { fr: 'Moyen', en: 'Medium' },
  large: { fr: 'Grand', en: 'Large' },
  fragile: { fr: 'Fragile', en: 'Fragile' },
  trackPackage: { fr: 'Suivre le colis', en: 'Track package' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, language: Language): string {
  return translations[key][language];
}

// Hook for easy translation
export function useTranslation() {
  const language = useI18n((s) => s.language);
  return {
    t: (key: TranslationKey) => t(key, language),
    language,
  };
}
