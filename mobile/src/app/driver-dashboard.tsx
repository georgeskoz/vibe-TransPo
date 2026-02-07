import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Power, MapPin, Navigation, Clock, DollarSign, Star, Car,
  Phone, X, Check, ChevronRight, AlertCircle, Calendar, Users
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

interface RideRequest {
  id: string;
  type: 'taxi' | 'food' | 'courier';
  pickupAddress: string;
  destinationAddress: string;
  distance: number;
  estimatedFare: number;
  passengerName: string;
  passengerRating: number;
  passengerTrips: number;
  pickupTime: 'now' | Date;
  expiresIn: number; // seconds
}

// Mock ride requests
const mockRideRequests: RideRequest[] = [
  {
    id: '1',
    type: 'taxi',
    pickupAddress: '1000 Rue Sherbrooke O, Montréal',
    destinationAddress: 'Aéroport YUL Terminal 1',
    distance: 22.5,
    estimatedFare: 68.50,
    passengerName: 'Marie L.',
    passengerRating: 4.8,
    passengerTrips: 156,
    pickupTime: 'now',
    expiresIn: 30,
  },
  {
    id: '2',
    type: 'taxi',
    pickupAddress: '200 Rue Sainte-Catherine E',
    destinationAddress: 'Centre Bell',
    distance: 3.2,
    estimatedFare: 15.80,
    passengerName: 'Jean-Marc T.',
    passengerRating: 4.9,
    passengerTrips: 89,
    pickupTime: 'now',
    expiresIn: 25,
  },
];

export default function DriverDashboardScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const isDriverOnline = useAppStore((s) => s.isDriverOnline);
  const setDriverOnline = useAppStore((s) => s.setDriverOnline);
  const todayEarnings = useAppStore((s) => s.todayEarnings);
  const todayTrips = useAppStore((s) => s.todayTrips);

  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
  const [requestTimer, setRequestTimer] = useState(0);
  const [showScheduledRides, setShowScheduledRides] = useState(false);

  // Pulse animation for online status
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isDriverOnline) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isDriverOnline]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Simulate incoming ride requests when online
  useEffect(() => {
    if (!isDriverOnline || currentRequest) return;

    const interval = setInterval(() => {
      // Random chance of getting a request
      if (Math.random() > 0.7) {
        const randomRequest = mockRideRequests[Math.floor(Math.random() * mockRideRequests.length)];
        setCurrentRequest({ ...randomRequest, id: Date.now().toString(), expiresIn: 30 });
        setRequestTimer(30);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Vibration.vibrate([0, 500, 200, 500]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isDriverOnline, currentRequest]);

  // Request timer countdown
  useEffect(() => {
    if (!currentRequest || requestTimer <= 0) return;

    const timer = setInterval(() => {
      setRequestTimer((prev) => {
        if (prev <= 1) {
          setCurrentRequest(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRequest, requestTimer]);

  const handleToggleOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setDriverOnline(!isDriverOnline);
  };

  const handleAcceptRide = () => {
    if (!currentRequest) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentRequest(null);
    // Navigate to active trip screen
    router.push('/trip');
  };

  const handleDeclineRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentRequest(null);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={isDriverOnline ? ['#0f2910', '#1a1a2e', '#0f0f23'] : ['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <View>
              <Text className="text-white text-2xl font-bold">
                {language === 'fr' ? 'Tableau de bord' : 'Dashboard'}
              </Text>
              <Text className="text-gray-400">
                {language === 'fr' ? 'Mode chauffeur' : 'Driver mode'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/profile')}
              className="w-12 h-12 bg-amber-500 rounded-full items-center justify-center"
            >
              <Text className="text-black text-xl font-bold">JP</Text>
            </Pressable>
          </View>

          {/* Online/Offline Toggle */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mt-4"
          >
            <Pressable
              onPress={handleToggleOnline}
              className={cn(
                'rounded-2xl overflow-hidden border-2',
                isDriverOnline ? 'border-emerald-500/50' : 'border-white/10'
              )}
            >
              <LinearGradient
                colors={isDriverOnline ? ['#10B981', '#059669'] : ['#374151', '#1F2937']}
                style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View className="flex-row items-center">
                  <Animated.View style={isDriverOnline ? pulseStyle : undefined}>
                    <Power size={28} color="#fff" />
                  </Animated.View>
                  <View className="ml-4">
                    <Text className="text-white text-xl font-bold">
                      {isDriverOnline ? t('online') : t('offline')}
                    </Text>
                    <Text className="text-white/70">
                      {isDriverOnline
                        ? (language === 'fr' ? 'Vous recevez des courses' : 'Receiving ride requests')
                        : (language === 'fr' ? 'Appuyez pour commencer' : 'Tap to go online')}
                    </Text>
                  </View>
                </View>
                <View className={cn(
                  'w-14 h-8 rounded-full p-1',
                  isDriverOnline ? 'bg-white/30' : 'bg-black/30'
                )}>
                  <View className={cn(
                    'w-6 h-6 rounded-full bg-white',
                    isDriverOnline ? 'ml-auto' : ''
                  )} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Today's Stats */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5 mt-6"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              {language === 'fr' ? "Aujourd'hui" : 'Today'}
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <DollarSign size={24} color="#FFB800" />
                <Text className="text-amber-400 text-2xl font-bold mt-2">
                  {formatCurrency(todayEarnings, language)}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {language === 'fr' ? 'Revenus' : 'Earnings'}
                </Text>
              </View>
              <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                <Car size={24} color="#9CA3AF" />
                <Text className="text-white text-2xl font-bold mt-2">{todayTrips}</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {language === 'fr' ? 'Courses' : 'Trips'}
                </Text>
              </View>
              <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                <Clock size={24} color="#9CA3AF" />
                <Text className="text-white text-2xl font-bold mt-2">4.2h</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {language === 'fr' ? 'En ligne' : 'Online'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Scheduled Rides */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="px-5 mt-6"
          >
            <Pressable
              onPress={() => setShowScheduledRides(!showScheduledRides)}
              className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Calendar size={24} color="#3B82F6" />
                <View className="ml-3">
                  <Text className="text-white font-semibold">
                    {language === 'fr' ? 'Courses planifiées' : 'Scheduled rides'}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {language === 'fr' ? '2 courses à venir' : '2 upcoming rides'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#3B82F6" />
            </Pressable>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            className="px-5 mt-6"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              {language === 'fr' ? 'Actions rapides' : 'Quick Actions'}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => router.push('/(tabs)/meter')}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center"
              >
                <View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mb-2">
                  <DollarSign size={24} color="#10B981" />
                </View>
                <Text className="text-white font-medium text-center">
                  {language === 'fr' ? 'Taximètre' : 'Taxi Meter'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/earnings')}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center"
              >
                <View className="w-12 h-12 bg-amber-500/20 rounded-full items-center justify-center mb-2">
                  <Star size={24} color="#FFB800" />
                </View>
                <Text className="text-white font-medium text-center">
                  {language === 'fr' ? 'Revenus' : 'Earnings'}
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 items-center"
              >
                <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center mb-2">
                  <Users size={24} color="#3B82F6" />
                </View>
                <Text className="text-white font-medium text-center">
                  {language === 'fr' ? 'Support' : 'Support'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Tips Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(500)}
            className="px-5 mt-6 mb-8"
          >
            <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <AlertCircle size={18} color="#FFB800" />
                <Text className="text-amber-400 font-semibold ml-2">
                  {language === 'fr' ? 'Conseil du jour' : 'Tip of the day'}
                </Text>
              </View>
              <Text className="text-gray-300 text-sm">
                {language === 'fr'
                  ? 'Les heures de pointe sont entre 7h-9h et 16h-18h. Positionnez-vous près des stations de métro pour plus de courses.'
                  : 'Peak hours are 7-9 AM and 4-6 PM. Position yourself near metro stations for more rides.'}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Incoming Ride Request Modal */}
        {currentRequest && (
          <Animated.View
            entering={SlideInUp.duration(400)}
            exiting={SlideOutDown.duration(300)}
            className="absolute bottom-0 left-0 right-0"
          >
            <LinearGradient
              colors={['transparent', '#000']}
              style={{ position: 'absolute', left: 0, right: 0, top: -100, bottom: 0 }}
            />
            <View className="bg-zinc-900 rounded-t-3xl border-t border-white/10">
              {/* Timer Bar */}
              <View className="h-1 bg-white/10 mx-5 mt-4 rounded-full overflow-hidden">
                <View
                  className="h-full bg-amber-500"
                  style={{ width: `${(requestTimer / 30) * 100}%` }}
                />
              </View>

              <View className="p-5">
                {/* Request Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-amber-500 rounded-full items-center justify-center">
                      <Car size={24} color="#000" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-white text-lg font-bold">{t('newRideRequest')}</Text>
                      <Text className="text-amber-400">{requestTimer}s</Text>
                    </View>
                  </View>
                  <Text className="text-amber-400 text-2xl font-bold">
                    {formatCurrency(currentRequest.estimatedFare, language)}
                  </Text>
                </View>

                {/* Route */}
                <View className="bg-white/5 rounded-xl p-4 mb-4">
                  <View className="flex-row">
                    <View className="items-center mr-3">
                      <View className="w-3 h-3 rounded-full bg-emerald-500" />
                      <View className="w-0.5 h-10 bg-white/20 my-1" />
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-400 text-xs">{t('pickupLocation')}</Text>
                      <Text className="text-white mb-3" numberOfLines={1}>
                        {currentRequest.pickupAddress}
                      </Text>
                      <Text className="text-gray-400 text-xs">{t('destination')}</Text>
                      <Text className="text-white" numberOfLines={1}>
                        {currentRequest.destinationAddress}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row mt-3 pt-3 border-t border-white/10">
                    <Text className="text-gray-400 flex-1">
                      {formatDistance(currentRequest.distance, language)}
                    </Text>
                    <Text className="text-gray-400">
                      ~{formatDuration(currentRequest.distance * 2, language)}
                    </Text>
                  </View>
                </View>

                {/* Passenger Info */}
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center">
                    <Text className="text-white font-bold">
                      {currentRequest.passengerName.charAt(0)}
                    </Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-white font-medium">{currentRequest.passengerName}</Text>
                    <View className="flex-row items-center">
                      <Star size={12} color="#FFB800" fill="#FFB800" />
                      <Text className="text-gray-400 text-sm ml-1">
                        {currentRequest.passengerRating} • {currentRequest.passengerTrips} trips
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleDeclineRide}
                    className="flex-1 bg-red-500/20 border border-red-500/30 rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <X size={20} color="#EF4444" />
                    <Text className="text-red-400 font-bold ml-2">{t('declineRide')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAcceptRide}
                    className="flex-1 rounded-xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Check size={20} color="#fff" />
                      <Text className="text-white font-bold ml-2">{t('acceptRide')}</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
