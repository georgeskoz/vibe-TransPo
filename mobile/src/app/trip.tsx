import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Phone, MessageSquare, X, Navigation, Star, Shield,
  Car, Check, MapPin
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, formatDuration } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

type TripPhase = 'searching' | 'found' | 'arriving' | 'in_progress' | 'completed';

const mockDriver = {
  name: 'Marc-André Gagnon',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  rating: 4.95,
  trips: 2847,
  vehicle: 'Toyota Camry',
  plate: 'QC 456 ABC',
  color: 'Gris / Grey',
  permitNumber: 'MTQ-4C-78234',
};

export default function TripScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [phase, setPhase] = useState<TripPhase>('searching');
  const [eta, setEta] = useState(4);
  const [fare] = useState(28.50);

  // Pulse animation for searching
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (phase === 'searching') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(0.5, { duration: 0 })
        ),
        -1,
        false
      );
    }
  }, [phase]);

  // Simulate trip progression
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (phase === 'searching') {
      timers.push(setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('found');
      }, 3000));
    } else if (phase === 'found') {
      timers.push(setTimeout(() => {
        setPhase('arriving');
      }, 2000));
    } else if (phase === 'arriving') {
      const interval = setInterval(() => {
        setEta((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setPhase('in_progress');
            return 0;
          }
          return prev - 1;
        });
      }, 3000);
      timers.push(interval as unknown as ReturnType<typeof setTimeout>);
    } else if (phase === 'in_progress') {
      timers.push(setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('completed');
      }, 5000));
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };

  const renderSearching = () => (
    <View className="flex-1 items-center justify-center px-5">
      <View className="relative w-40 h-40 items-center justify-center">
        <Animated.View
          style={[pulseStyle, {
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: '#FFB800',
          }]}
        />
        <View className="w-24 h-24 bg-amber-500 rounded-full items-center justify-center">
          <Car size={40} color="#000" />
        </View>
      </View>
      <Text className="text-white text-2xl font-bold mt-8">{t('findingDriver')}</Text>
      <Text className="text-gray-400 mt-2 text-center">
        {language === 'fr'
          ? 'Recherche d\'un chauffeur disponible près de vous...'
          : 'Looking for an available driver near you...'}
      </Text>

      <Pressable
        onPress={handleCancel}
        className="mt-12 bg-white/10 border border-white/20 rounded-full px-8 py-3"
      >
        <Text className="text-white font-medium">{t('cancel')}</Text>
      </Pressable>
    </View>
  );

  const renderDriverInfo = () => (
    <Animated.View
      entering={FadeInUp.duration(500)}
      className="flex-1"
    >
      {/* Map placeholder */}
      <View className="flex-1 bg-zinc-900 relative">
        <LinearGradient
          colors={['#1a1a2e', '#2d3748']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-16 h-16 bg-emerald-500/20 rounded-full items-center justify-center">
            <MapPin size={32} color="#10B981" />
          </View>
          <Text className="text-gray-400 mt-4">
            {language === 'fr' ? 'Carte interactive' : 'Interactive map'}
          </Text>
        </View>

        {/* Status banner */}
        <View className="absolute top-4 left-4 right-4">
          <View className={cn(
            'rounded-2xl p-4 flex-row items-center',
            phase === 'arriving' ? 'bg-amber-500' : phase === 'in_progress' ? 'bg-emerald-500' : 'bg-blue-500'
          )}>
            {phase === 'arriving' ? (
              <>
                <Car size={24} color="#000" />
                <View className="ml-3 flex-1">
                  <Text className="text-black font-bold">{t('driverArriving')}</Text>
                  <Text className="text-black/70">{eta} min</Text>
                </View>
              </>
            ) : phase === 'in_progress' ? (
              <>
                <Navigation size={24} color="#000" />
                <View className="ml-3 flex-1">
                  <Text className="text-black font-bold">{t('tripInProgress')}</Text>
                  <Text className="text-black/70">
                    {language === 'fr' ? 'En route vers votre destination' : 'On the way to your destination'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Check size={24} color="#fff" />
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold">{t('driverFound')}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Driver Card */}
      <View className="bg-zinc-950 rounded-t-3xl -mt-6 pt-6 px-5 pb-8">
        {/* Driver Profile */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-gray-700 items-center justify-center overflow-hidden">
            <Text className="text-white text-2xl font-bold">MA</Text>
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white text-lg font-bold">{mockDriver.name}</Text>
            <View className="flex-row items-center mt-1">
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text className="text-amber-400 font-medium ml-1">{mockDriver.rating}</Text>
              <Text className="text-gray-400 ml-2">• {mockDriver.trips} courses</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <Pressable className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <Phone size={20} color="#fff" />
            </Pressable>
            <Pressable className="w-12 h-12 bg-white/10 rounded-full items-center justify-center">
              <MessageSquare size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Vehicle Info */}
        <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-sm">{mockDriver.vehicle}</Text>
              <Text className="text-white text-xl font-bold font-mono">{mockDriver.plate}</Text>
              <Text className="text-gray-400 text-sm mt-1">{mockDriver.color}</Text>
            </View>
            <View className="w-16 h-16 bg-gray-800 rounded-xl items-center justify-center">
              <Car size={32} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* MTQ Permit */}
        <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex-row items-center mb-4">
          <Shield size={18} color="#10B981" />
          <Text className="text-emerald-400 text-sm ml-2">
            {t('permitNumber')}: {mockDriver.permitNumber}
          </Text>
        </View>

        {/* Fare */}
        <View className="flex-row items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
          <Text className="text-gray-400">{t('estimatedFare')}</Text>
          <Text className="text-white text-xl font-bold">{formatCurrency(fare, language)}</Text>
        </View>

        {/* Cancel button */}
        {phase !== 'in_progress' && (
          <Pressable
            onPress={handleCancel}
            className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 items-center"
          >
            <Text className="text-red-400 font-semibold">{t('cancel')}</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );

  const renderCompleted = () => (
    <View className="flex-1 items-center justify-center px-5">
      <View className="w-24 h-24 bg-emerald-500 rounded-full items-center justify-center mb-6">
        <Check size={48} color="#fff" />
      </View>
      <Text className="text-white text-2xl font-bold text-center">
        {language === 'fr' ? 'Course terminée!' : 'Trip completed!'}
      </Text>
      <Text className="text-gray-400 mt-2 text-center">
        {language === 'fr'
          ? 'Merci d\'avoir choisi QuébecTaxi'
          : 'Thank you for choosing QuébecTaxi'}
      </Text>

      {/* Fare Summary */}
      <View className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mt-8">
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-400">{t('total')}</Text>
          <Text className="text-white text-2xl font-bold">{formatCurrency(fare, language)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-400">{t('paymentMethod')}</Text>
          <Text className="text-white">•••• 4242</Text>
        </View>
      </View>

      {/* Rating */}
      <View className="w-full mt-6">
        <Text className="text-white font-semibold mb-3 text-center">{t('rateYourTrip')}</Text>
        <View className="flex-row justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} className="p-2">
              <Star size={36} color="#FFB800" fill="#FFB800" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Done button */}
      <Pressable
        onPress={handleComplete}
        className="w-full mt-8 rounded-2xl overflow-hidden"
      >
        <LinearGradient
          colors={['#FFB800', '#FF8C00']}
          style={{ padding: 18, alignItems: 'center' }}
        >
          <Text className="text-black text-lg font-bold">
            {language === 'fr' ? 'Terminé' : 'Done'}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        {phase === 'searching' && renderSearching()}
        {(phase === 'found' || phase === 'arriving' || phase === 'in_progress') && renderDriverInfo()}
        {phase === 'completed' && renderCompleted()}
      </SafeAreaView>
    </View>
  );
}
