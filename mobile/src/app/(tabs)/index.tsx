import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MapPin, Search, Car, Package, UtensilsCrossed, ChevronRight, Clock, Star, Zap, Phone, X, Power } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, FadeIn } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAppStore, ServiceType } from '@/lib/store';
import { formatCurrency, estimateFare } from '@/lib/quebec-taxi';
import { useRouter } from 'expo-router';
import { cn } from '@/lib/cn';
import { DriverBottomSheet } from '@/components/DriverBottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const services: { type: ServiceType; icon: any; gradient: [string, string] }[] = [
  { type: 'taxi', icon: Car, gradient: ['#FFB800', '#FF8C00'] },
  { type: 'courier', icon: Package, gradient: ['#00C6FF', '#0072FF'] },
  { type: 'food', icon: UtensilsCrossed, gradient: ['#FF416C', '#FF4B2B'] },
];

const recentPlaces = [
  { id: '1', name: 'Aéroport YUL', address: '975 Roméo-Vachon Blvd N, Dorval', icon: '✈️' },
  { id: '2', name: 'Centre Bell', address: '1909 Avenue des Canadiens-de-Montréal', icon: '🏒' },
  { id: '3', name: 'Vieux-Port', address: '333 Rue de la Commune O, Montréal', icon: '⚓' },
];

const promotions = [
  { id: '1', title: '20% off', subtitle: 'First ride', code: 'BIENVENUE', color: '#FFB800' },
  { id: '2', title: '15% off', subtitle: 'Airport rides', code: 'YUL15', color: '#0072FF' },
];

export default function HomeScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const userMode = useAppStore((s) => s.userMode);
  const serviceType = useAppStore((s) => s.serviceType);
  const setServiceType = useAppStore((s) => s.setServiceType);
  const setUserMode = useAppStore((s) => s.setUserMode);
  const driverStatus = useAppStore((s) => s.driverStatus);
  const setDriverStatus = useAppStore((s) => s.setDriverStatus);

  const isDriver = userMode === 'driver';

  if (isDriver) {
    return <DriverHomeScreen />;
  }

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(100)}
            className="px-5 pt-4 pb-2"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Bonjour' : 'Hello'}
                </Text>
                <Text className="text-white text-2xl font-bold">TransPo</Text>
              </View>
              <Pressable
                onPress={() => setUserMode('driver')}
                className="bg-white/10 px-4 py-2 rounded-full"
              >
                <Text className="text-amber-400 font-medium">
                  {language === 'fr' ? 'Mode chauffeur' : 'Driver mode'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(200)}
            className="px-5 mt-4"
          >
            <Pressable
              onPress={() => {
                if (serviceType === 'taxi') router.push('/booking');
                else if (serviceType === 'courier') router.push('/courier');
                else if (serviceType === 'food') router.push('/food');
              }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                <Search size={20} color="#FFB800" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-medium">
                  {serviceType === 'taxi' ? t('whereToGo') : serviceType === 'courier' ? t('sendPackage') : t('orderFood')}
                </Text>
                <Text className="text-gray-500 text-sm mt-0.5">
                  {serviceType === 'taxi' ? t('currentLocation') : serviceType === 'courier' ? t('courier') : t('restaurants')}
                </Text>
              </View>
              <ChevronRight size={24} color="#6B7280" />
            </Pressable>
          </Animated.View>

          {/* Service Selection */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300)}
            className="px-5 mt-6"
          >
            <Text className="text-white text-lg font-semibold mb-3">{t('selectService')}</Text>
            <View className="flex-row gap-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                const isSelected = serviceType === service.type;
                return (
                  <Pressable
                    key={service.type}
                    onPress={() => setServiceType(service.type)}
                    className={cn(
                      'flex-1 rounded-2xl overflow-hidden',
                      isSelected ? 'border-2 border-white/30' : 'border border-white/10'
                    )}
                  >
                    <LinearGradient
                      colors={isSelected ? service.gradient : ['#1f1f1f', '#1f1f1f']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 16, alignItems: 'center' }}
                    >
                      <View className={cn(
                        'w-12 h-12 rounded-full items-center justify-center mb-2',
                        isSelected ? 'bg-white/20' : 'bg-white/5'
                      )}>
                        <Icon size={24} color={isSelected ? '#fff' : '#9CA3AF'} />
                      </View>
                      <Text className={cn(
                        'font-semibold',
                        isSelected ? 'text-white' : 'text-gray-400'
                      )}>
                        {t(service.type)}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* MTQ Compliance Badge */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(350)}
            className="px-5 mt-6"
          >
            <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex-row items-center">
              <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center mr-3">
                <Zap size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-400 font-semibold">{t('mtqCompliant')}</Text>
                <Text className="text-gray-400 text-sm">
                  {language === 'fr'
                    ? 'Conforme aux réglementations du Québec 2026'
                    : 'Compliant with Quebec 2026 regulations'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Promotions */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(400)}
            className="mt-6"
          >
            <Text className="text-white text-lg font-semibold mb-3 px-5">
              {language === 'fr' ? 'Promotions' : 'Promotions'}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              style={{ flexGrow: 0 }}
            >
              {promotions.map((promo) => (
                <Pressable
                  key={promo.id}
                  className="w-64 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={[promo.color, promo.color + '80']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 20 }}
                  >
                    <Text className="text-white/80 text-sm font-medium">{promo.subtitle}</Text>
                    <Text className="text-white text-3xl font-bold mt-1">{promo.title}</Text>
                    <View className="bg-white/20 self-start px-3 py-1 rounded-full mt-3">
                      <Text className="text-white font-mono font-medium">{promo.code}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Recent Places */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            className="px-5 mt-6 mb-8"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              {language === 'fr' ? 'Lieux récents' : 'Recent places'}
            </Text>
            <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
              {recentPlaces.map((place, index) => (
                <Pressable
                  key={place.id}
                  onPress={() => router.push('/booking')}
                  className={cn(
                    'flex-row items-center p-4',
                    index < recentPlaces.length - 1 && 'border-b border-white/5'
                  )}
                >
                  <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-lg">{place.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium">{place.name}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={1}>
                      {place.address}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function DriverHomeScreen() {
  const { t, language } = useTranslation();
  const driverStatus = useAppStore((s) => s.driverStatus);
  const setDriverStatus = useAppStore((s) => s.setDriverStatus);
  const setUserMode = useAppStore((s) => s.setUserMode);
  const todayEarnings = useAppStore((s) => s.todayEarnings);
  const pendingRequest = useAppStore((s) => s.pendingRequest);
  const setPendingRequest = useAppStore((s) => s.setPendingRequest);

  const isOnline = driverStatus === 'online';
  const [showIncomingRequest, setShowIncomingRequest] = useState(!!pendingRequest);
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (pendingRequest) {
      setShowIncomingRequest(true);
      setCountdown(20);
    }
  }, [pendingRequest]);

  useEffect(() => {
    if (!showIncomingRequest || countdown === null) return;

    if (countdown === 0) {
      setPendingRequest(null);
      setShowIncomingRequest(false);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, showIncomingRequest]);

  const handleAcceptRide = () => {
    setShowIncomingRequest(false);
    setCountdown(20);
    setDriverStatus('busy');
  };

  const handleDeclineRide = () => {
    setPendingRequest(null);
    setShowIncomingRequest(false);
    setCountdown(20);
  };

  const toggleOnline = () => {
    setDriverStatus(isOnline ? 'offline' : 'online');
  };

  if (!isOnline) {
    return (
      <View className="flex-1 bg-zinc-950">
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f0f23']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />

        <SafeAreaView className="flex-1" edges={['top']}>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
              <View>
                <Text className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Mode chauffeur' : 'Driver mode'}
                </Text>
                <Text className="text-white text-2xl font-bold">TransPo</Text>
              </View>
              <Pressable
                onPress={() => setUserMode('rider')}
                className="bg-white/10 px-4 py-2 rounded-full"
              >
                <Text className="text-amber-400 font-medium">
                  {language === 'fr' ? 'Mode passager' : 'Rider mode'}
                </Text>
              </Pressable>
            </View>

            <View className="px-5 mt-6">
              <Pressable
                onPress={toggleOnline}
                className="rounded-2xl p-6 items-center border bg-white/5 border-white/10"
              >
                <View className="w-20 h-20 rounded-full items-center justify-center mb-4 bg-gray-700">
                  <Car size={36} color="#fff" />
                </View>
                <Text className="text-2xl font-bold text-gray-400">{t('offline')}</Text>
                <Text className="text-gray-400 mt-2">
                  {language === 'fr' ? 'Appuyez pour vous connecter' : 'Tap to go online'}
                </Text>
              </Pressable>
            </View>

            <View className="px-5 mt-6">
              <Text className="text-white text-lg font-semibold mb-3">
                {language === 'fr' ? 'Aujourd\'hui' : 'Today'}
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Text className="text-gray-400 text-sm">{t('earnings')}</Text>
                  <Text className="text-white text-2xl font-bold mt-1">
                    {formatCurrency(todayEarnings, language)}
                  </Text>
                </View>
                <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Text className="text-gray-400 text-sm">
                    {language === 'fr' ? 'Courses' : 'Trips'}
                  </Text>
                  <Text className="text-white text-2xl font-bold mt-1">0</Text>
                </View>
                <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <Text className="text-gray-400 text-sm">
                    {language === 'fr' ? 'Heures' : 'Hours'}
                  </Text>
                  <Text className="text-white text-2xl font-bold mt-1">0h</Text>
                </View>
              </View>
            </View>

            <View className="px-5 mt-6 mb-8">
              <Text className="text-white text-lg font-semibold mb-3">
                {language === 'fr' ? 'Actions rapides' : 'Quick actions'}
              </Text>
              <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <Pressable
                  onPress={() => {
                    if (!pendingRequest) {
                      setPendingRequest({
                        id: 'req_' + Date.now(),
                        pickup: { latitude: 45.5017, longitude: -73.5673, address: '123 Rue Saint-Catherine' },
                        destination: { latitude: 45.4950, longitude: -73.5732, address: '456 Rue de Bleury' },
                        estimatedFare: { baseFare: 3.5, distanceFare: 5.7, waitingFare: 0, airportSurcharge: 0, regulatoryFee: 0.9, subtotal: 10.1, gst: 0.5, qst: 1.0, totalTaxes: 1.5, total: 11.6, isNightRate: false },
                        estimatedDistance: 3,
                        passengerName: 'Sarah M.',
                        passengerRating: 4.8,
                      });
                    }
                  }}
                  className="flex-row items-center p-4 border-b border-white/5"
                >
                  <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                    <Car size={20} color="#FFB800" />
                  </View>
                  <Text className="flex-1 text-white font-medium">{t('taxiMeter')}</Text>
                  <ChevronRight size={20} color="#6B7280" />
                </Pressable>
                <Pressable className="flex-row items-center p-4 border-b border-white/5">
                  <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center mr-3">
                    <Star size={20} color="#10B981" />
                  </View>
                  <Text className="flex-1 text-white font-medium">{t('tripHistory')}</Text>
                  <ChevronRight size={20} color="#6B7280" />
                </Pressable>
                <Pressable className="flex-row items-center p-4">
                  <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mr-3">
                    <Package size={20} color="#3B82F6" />
                  </View>
                  <Text className="flex-1 text-white font-medium">{t('documents')}</Text>
                  <ChevronRight size={20} color="#6B7280" />
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-slate-300">
        {/* Map Background */}
        <View className="absolute inset-0">
          <LinearGradient
            colors={['#b8dfe8', '#a3d5e0', '#8dcad8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />

          {/* Street grid pattern */}
          <View className="absolute inset-0">
            {/* Horizontal streets */}
            {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720, 780].map((offset) => (
              <View
                key={`h-${offset}`}
                style={{
                  position: 'absolute',
                  top: offset,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                }}
              />
            ))}
            {/* Vertical streets */}
            {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((offset) => (
              <View
                key={`v-${offset}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: offset,
                  width: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.35)',
                }}
              />
            ))}
          </View>

          {/* Green areas (parks) */}
          <View className="absolute top-1/4 left-1/4 w-24 h-24 bg-green-400/35 rounded-full blur-xl" />
          <View className="absolute top-1/3 right-1/4 w-32 h-32 bg-emerald-400/30 rounded-full blur-xl" />
          <View className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-teal-400/25 rounded-full blur-xl" />
        </View>

        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Driver Location Indicator */}
          <View className="absolute inset-0 items-center justify-center z-5 pointer-events-none">
            <View className="w-12 h-12 bg-black rounded-full border-4 border-white shadow-lg items-center justify-center">
              <Car size={24} color="#fff" />
            </View>
            <View className="w-16 h-16 border-2 border-white/40 rounded-full absolute" />
          </View>

          {/* Floating Action Button - Simulate Ride Request */}
          <View className="absolute bottom-32 right-5 z-10">
            <Pressable
              onPress={() => {
                if (!pendingRequest) {
                  setPendingRequest({
                    id: 'req_' + Date.now(),
                    pickup: { latitude: 45.5017, longitude: -73.5673, address: '123 Rue Saint-Catherine' },
                    destination: { latitude: 45.4950, longitude: -73.5732, address: '456 Rue de Bleury' },
                    estimatedFare: { baseFare: 3.5, distanceFare: 5.7, waitingFare: 0, airportSurcharge: 0, regulatoryFee: 0.9, subtotal: 10.1, gst: 0.5, qst: 1.0, totalTaxes: 1.5, total: 11.6, isNightRate: false },
                    estimatedDistance: 3,
                    passengerName: 'Sarah M.',
                    passengerRating: 4.8,
                  });
                }
              }}
              className="w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center"
            >
              <Search size={22} color="#000" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Bottom Sheet for Driver Menu */}
        <DriverBottomSheet
          onLogout={() => {
            setDriverStatus('offline');
          }}
        />

        {/* Incoming Ride Request Modal */}
        {showIncomingRequest && pendingRequest && (
          <Modal transparent animationType="fade">
            <View className="flex-1 bg-black/50">
              <Animated.View
                entering={FadeIn.duration(300)}
                className="flex-1 justify-end"
              >
                <BlurView intensity={90} className="absolute inset-0" />
                <View className="bg-zinc-900 rounded-t-3xl p-6 pb-8">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-white text-xl font-bold">
                      {language === 'fr' ? 'Nouvelle course' : 'New ride'}
                    </Text>
                    <Pressable onPress={handleDeclineRide}>
                      <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center">
                        <X size={18} color="#fff" />
                      </View>
                    </Pressable>
                  </View>

                  <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-500 items-center justify-center mb-4">
                      <Text className="text-amber-400 text-5xl font-bold">{countdown}</Text>
                    </View>
                    <Text className="text-gray-400 text-sm">
                      {language === 'fr' ? 'secondes avant refus' : 'seconds before decline'}
                    </Text>
                  </View>

                  <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                    <View className="flex-row items-center mb-4">
                      <View className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full items-center justify-center mr-4">
                        <Text className="text-white text-lg font-bold">S</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold">{pendingRequest.passengerName}</Text>
                        <View className="flex-row items-center mt-1">
                          <Star size={14} color="#FFB800" fill="#FFB800" />
                          <Text className="text-gray-400 text-xs ml-1">{pendingRequest.passengerRating}</Text>
                        </View>
                      </View>
                    </View>

                    <View className="space-y-3">
                      <View className="flex-row items-start">
                        <View className="w-6 h-6 bg-emerald-500/20 rounded-full items-center justify-center mr-3 mt-1">
                          <MapPin size={12} color="#10B981" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-400 text-xs mb-1">
                            {language === 'fr' ? 'Départ' : 'Pickup'}
                          </Text>
                          <Text className="text-white text-sm font-medium">
                            {pendingRequest.pickup.address}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-start">
                        <View className="w-6 h-6 bg-red-500/20 rounded-full items-center justify-center mr-3 mt-1">
                          <MapPin size={12} color="#EF4444" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-400 text-xs mb-1">
                            {language === 'fr' ? 'Destination' : 'Dropoff'}
                          </Text>
                          <Text className="text-white text-sm font-medium">
                            {pendingRequest.destination.address}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Text className="text-gray-400 text-xs mb-1">
                        {language === 'fr' ? 'Distance' : 'Distance'}
                      </Text>
                      <Text className="text-white text-lg font-bold">
                        {pendingRequest.estimatedDistance} km
                      </Text>
                    </View>
                    <View className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                      <Text className="text-gray-400 text-xs mb-1">
                        {language === 'fr' ? 'Tarif estimé' : 'Est. fare'}
                      </Text>
                      <Text className="text-amber-400 text-lg font-bold">
                        ${pendingRequest.estimatedFare.total.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={handleDeclineRide}
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 items-center"
                    >
                      <Text className="text-gray-300 font-semibold">
                        {language === 'fr' ? 'Refuser' : 'Decline'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAcceptRide}
                      className="flex-1 bg-emerald-500 rounded-xl py-4 items-center"
                    >
                      <View className="flex-row items-center">
                        <Phone size={18} color="#fff" strokeWidth={2.5} />
                        <Text className="text-white font-bold ml-2">
                          {language === 'fr' ? 'Accepter' : 'Accept'}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Modal>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
