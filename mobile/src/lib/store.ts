import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FareBreakdown } from './quebec-taxi';

export type UserMode = 'rider' | 'driver';
export type ServiceType = 'taxi' | 'courier' | 'food';
export type TripStatus = 'idle' | 'searching' | 'driver_found' | 'arriving' | 'in_progress' | 'completed';
export type DriverStatus = 'offline' | 'online' | 'busy';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  photo: string;
  rating: number;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  permitNumber: string;
}

export interface Trip {
  id: string;
  status: TripStatus;
  serviceType: ServiceType;
  pickup: Location;
  destination: Location;
  driver?: Driver;
  fare?: FareBreakdown;
  estimatedArrival?: number; // minutes
  startTime?: Date;
  endTime?: Date;
  distanceKm?: number;
  durationMinutes?: number;
}

export interface RideRequest {
  id: string;
  pickup: Location;
  destination: Location;
  estimatedFare: FareBreakdown;
  estimatedDistance: number;
  passengerName: string;
  passengerRating: number;
}

interface AppStore {
  // User mode
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;

  // Service type
  serviceType: ServiceType;
  setServiceType: (type: ServiceType) => void;

  // Rider state
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: TripStatus) => void;

  // Driver state
  driverStatus: DriverStatus;
  setDriverStatus: (status: DriverStatus) => void;
  isDriverOnline: boolean;
  setDriverOnline: (online: boolean) => void;
  pendingRequest: RideRequest | null;
  setPendingRequest: (request: RideRequest | null) => void;
  activeTrip: Trip | null;
  setActiveTrip: (trip: Trip | null) => void;

  // Taxi meter
  meterRunning: boolean;
  meterPaused: boolean;
  meterStartTime: Date | null;
  meterDistance: number;
  meterWaitingTime: number;
  startMeter: () => void;
  stopMeter: () => void;
  pauseMeter: () => void;
  resumeMeter: () => void;
  updateMeterDistance: (distance: number) => void;
  updateMeterWaitingTime: (seconds: number) => void;
  resetMeter: () => void;

  // Earnings (driver)
  todayEarnings: number;
  todayTrips: number;
  weeklyEarnings: number;
  pendingPayout: number;
  completedTrips: Trip[];
  addCompletedTrip: (trip: Trip) => void;

  // Persistence
  loadState: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // User mode
  userMode: 'rider',
  setUserMode: async (mode) => {
    await AsyncStorage.setItem('user_mode', mode);
    set({ userMode: mode });
  },

  // Service type
  serviceType: 'taxi',
  setServiceType: (type) => set({ serviceType: type }),

  // Rider state
  currentTrip: null,
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  updateTripStatus: (status) => {
    const { currentTrip } = get();
    if (currentTrip) {
      set({ currentTrip: { ...currentTrip, status } });
    }
  },

  // Driver state
  driverStatus: 'offline',
  setDriverStatus: async (status) => {
    await AsyncStorage.setItem('driver_status', status);
    set({ driverStatus: status });
  },
  isDriverOnline: false,
  setDriverOnline: async (online) => {
    await AsyncStorage.setItem('driver_online', online ? 'true' : 'false');
    set({ isDriverOnline: online, driverStatus: online ? 'online' : 'offline' });
  },
  pendingRequest: null,
  setPendingRequest: (request) => set({ pendingRequest: request }),
  activeTrip: null,
  setActiveTrip: (trip) => set({ activeTrip: trip }),

  // Taxi meter
  meterRunning: false,
  meterPaused: false,
  meterStartTime: null,
  meterDistance: 0,
  meterWaitingTime: 0,
  startMeter: () => set({
    meterRunning: true,
    meterPaused: false,
    meterStartTime: new Date(),
    meterDistance: 0,
    meterWaitingTime: 0,
  }),
  stopMeter: () => set({
    meterRunning: false,
    meterPaused: false,
  }),
  pauseMeter: () => set({ meterPaused: true }),
  resumeMeter: () => set({ meterPaused: false }),
  updateMeterDistance: (distance) => set({ meterDistance: distance }),
  updateMeterWaitingTime: (seconds) => set({ meterWaitingTime: seconds / 60 }), // Convert to minutes
  resetMeter: () => set({
    meterRunning: false,
    meterPaused: false,
    meterStartTime: null,
    meterDistance: 0,
    meterWaitingTime: 0,
  }),

  // Earnings
  todayEarnings: 0,
  todayTrips: 0,
  weeklyEarnings: 0,
  pendingPayout: 0,
  completedTrips: [],
  addCompletedTrip: (trip) => {
    const { completedTrips, todayEarnings, weeklyEarnings, todayTrips } = get();
    const tripEarnings = trip.fare?.total || 0;
    set({
      completedTrips: [trip, ...completedTrips],
      todayEarnings: todayEarnings + tripEarnings,
      weeklyEarnings: weeklyEarnings + tripEarnings,
      todayTrips: todayTrips + 1,
    });
  },

  // Persistence
  loadState: async () => {
    const mode = await AsyncStorage.getItem('user_mode');
    if (mode === 'rider' || mode === 'driver') {
      set({ userMode: mode });
    }
    const status = await AsyncStorage.getItem('driver_status');
    if (status === 'offline' || status === 'online' || status === 'busy') {
      set({ driverStatus: status });
    }
  },
}));
