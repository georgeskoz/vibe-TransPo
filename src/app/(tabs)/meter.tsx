import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Square, RotateCcw, MapPin, Clock, Navigation, Receipt } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import {
  calculateFare,
  formatCurrency,
  formatDistance,
  formatDuration,
  QUEBEC_TAXI_RATES,
  FareBreakdown,
  getCurrentRates,
  isNightRate,
} from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

export default function MeterScreen() {
  const { t, language } = useTranslation();

  const meterRunning = useAppStore((s) => s.meterRunning);
  const meterPaused = useAppStore((s) => s.meterPaused);
  const meterStartTime = useAppStore((s) => s.meterStartTime);
  const meterDistance = useAppStore((s) => s.meterDistance);
  const meterWaitingTime = useAppStore((s) => s.meterWaitingTime);
  const startMeter = useAppStore((s) => s.startMeter);
  const stopMeter = useAppStore((s) => s.stopMeter);
  const pauseMeter = useAppStore((s) => s.pauseMeter);
  const resumeMeter = useAppStore((s) => s.resumeMeter);
  const resetMeter = useAppStore((s) => s.resetMeter);
  const updateMeterDistance = useAppStore((s) => s.updateMeterDistance);
  const updateMeterWaitingTime = useAppStore((s) => s.updateMeterWaitingTime);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [isAirport, setIsAirport] = useState(false);

  // Simulated distance increase (in real app, use GPS)
  const distanceRef = useRef(0);
  const waitingRef = useRef(0);

  // Pulse animation for running meter
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (meterRunning && !meterPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [meterRunning, meterPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (meterRunning && !meterPaused && meterStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - meterStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);

        // Simulate distance increase (0.5-1.5 km per minute when moving)
        // In real app, this would come from GPS
        const isMoving = Math.random() > 0.3; // 70% chance of moving
        if (isMoving) {
          distanceRef.current += (Math.random() * 0.025 + 0.01); // ~0.6-2.1 km/min
          updateMeterDistance(distanceRef.current);
        } else {
          waitingRef.current += 1;
          updateMeterWaitingTime(waitingRef.current);
        }

        // Calculate fare
        const newFare = calculateFare({
          distanceKm: distanceRef.current,
          durationMinutes: elapsed / 60,
          waitingMinutes: waitingRef.current / 60,
          isAirport,
        });
        setFare(newFare);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meterRunning, meterPaused, meterStartTime, isAirport]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    distanceRef.current = 0;
    waitingRef.current = 0;
    startMeter();
  };

  const handleStop = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopMeter();
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (meterPaused) {
      resumeMeter();
    } else {
      pauseMeter();
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    distanceRef.current = 0;
    waitingRef.current = 0;
    setElapsedSeconds(0);
    setFare(null);
    resetMeter();
  };

  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={meterRunning ? ['#1a2f1a', '#0f2010', '#0a150a'] : ['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-5 pt-4 pb-2">
            <Text className="text-white text-2xl font-bold">{t('taxiMeter')}</Text>
            <Text className="text-gray-400 mt-1">{t('mtqCompliant')}</Text>
          </View>

          {/* Main Meter Display */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mt-4"
          >
            <Animated.View
              style={pulseStyle}
              className={cn(
                'rounded-3xl p-6 border-2',
                meterRunning
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-white/10'
              )}
            >
              {/* Fare Display */}
              <View className="items-center mb-6">
                <Text className="text-gray-400 text-sm uppercase tracking-wider">
                  {t('fare')}
                </Text>
                <Text className={cn(
                  'text-5xl font-bold mt-2 font-mono',
                  meterRunning ? 'text-emerald-400' : 'text-white'
                )}>
                  {fare ? formatCurrency(fare.total, language) : formatCurrency(0, language)}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row justify-between mb-4">
                <View className="items-center flex-1">
                  <View className="flex-row items-center mb-1">
                    <Navigation size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{t('distance')}</Text>
                  </View>
                  <Text className="text-white text-xl font-semibold font-mono">
                    {formatDistance(meterDistance, language)}
                  </Text>
                </View>

                <View className="w-px bg-white/10" />

                <View className="items-center flex-1">
                  <View className="flex-row items-center mb-1">
                    <Clock size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{t('duration')}</Text>
                  </View>
                  <Text className="text-white text-xl font-semibold font-mono">
                    {formatElapsedTime(elapsedSeconds)}
                  </Text>
                </View>

                <View className="w-px bg-white/10" />

                <View className="items-center flex-1">
                  <View className="flex-row items-center mb-1">
                    <Pause size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">{t('waitingTime')}</Text>
                  </View>
                  <Text className="text-white text-xl font-semibold font-mono">
                    {formatDuration(meterWaitingTime, language)}
                  </Text>
                </View>
              </View>

              {/* Status Indicator */}
              {meterRunning && (
                <View className={cn(
                  'flex-row items-center justify-center py-2 rounded-full mt-2',
                  meterPaused ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                )}>
                  <View className={cn(
                    'w-2 h-2 rounded-full mr-2',
                    meterPaused ? 'bg-amber-500' : 'bg-emerald-500'
                  )} />
                  <Text className={cn(
                    'font-medium',
                    meterPaused ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {meterPaused
                      ? (language === 'fr' ? 'En pause' : 'Paused')
                      : t('tripInProgress')}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* Control Buttons */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5 mt-6"
          >
            <View className="flex-row gap-3">
              {!meterRunning ? (
                <Pressable
                  onPress={handleStart}
                  className="flex-1 rounded-2xl overflow-hidden"
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={{ padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  >
                    <Play size={24} color="#fff" fill="#fff" />
                    <Text className="text-white text-lg font-bold ml-3">{t('startTrip')}</Text>
                  </LinearGradient>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={handlePause}
                    className="flex-1 bg-amber-500/20 border border-amber-500/30 rounded-2xl p-5 flex-row items-center justify-center"
                  >
                    {meterPaused ? (
                      <Play size={24} color="#F59E0B" />
                    ) : (
                      <Pause size={24} color="#F59E0B" />
                    )}
                    <Text className="text-amber-400 font-bold ml-2">
                      {meterPaused ? t('resumeTrip') : t('pauseTrip')}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleStop}
                    className="flex-1 rounded-2xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={['#EF4444', '#DC2626']}
                      style={{ padding: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                      <Square size={24} color="#fff" fill="#fff" />
                      <Text className="text-white font-bold ml-2">{t('endTrip')}</Text>
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </View>

            {/* Reset Button */}
            {!meterRunning && fare && (
              <Pressable
                onPress={handleReset}
                className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center justify-center"
              >
                <RotateCcw size={20} color="#9CA3AF" />
                <Text className="text-gray-400 font-medium ml-2">
                  {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Airport Toggle */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(250)}
            className="px-5 mt-6"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsAirport(!isAirport);
              }}
              className={cn(
                'flex-row items-center justify-between p-4 rounded-2xl border',
                isAirport
                  ? 'bg-blue-500/20 border-blue-500/30'
                  : 'bg-white/5 border-white/10'
              )}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">✈️</Text>
                <View>
                  <Text className={cn('font-medium', isAirport ? 'text-blue-400' : 'text-white')}>
                    {language === 'fr' ? 'Supplément aéroport' : 'Airport surcharge'}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    +{formatCurrency(QUEBEC_TAXI_RATES.AIRPORT_SURCHARGE, language)}
                  </Text>
                </View>
              </View>
              <View className={cn(
                'w-12 h-7 rounded-full p-1',
                isAirport ? 'bg-blue-500' : 'bg-gray-700'
              )}>
                <View className={cn(
                  'w-5 h-5 rounded-full bg-white',
                  isAirport ? 'ml-auto' : ''
                )} />
              </View>
            </Pressable>
          </Animated.View>

          {/* Fare Breakdown */}
          {fare && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="px-5 mt-6 mb-8"
            >
              <Text className="text-white text-lg font-semibold mb-3">
                {language === 'fr' ? 'Détail du tarif' : 'Fare breakdown'}
              </Text>
              <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-400">{t('baseFare')}</Text>
                  <Text className="text-white">{formatCurrency(fare.baseFare, language)}</Text>
                </View>
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-400">{t('distanceFare')}</Text>
                  <Text className="text-white">{formatCurrency(fare.distanceFare, language)}</Text>
                </View>
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-400">{t('waitingTime')}</Text>
                  <Text className="text-white">{formatCurrency(fare.waitingFare, language)}</Text>
                </View>
                {fare.airportSurcharge > 0 && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">
                      {language === 'fr' ? 'Supplément aéroport' : 'Airport surcharge'}
                    </Text>
                    <Text className="text-white">{formatCurrency(fare.airportSurcharge, language)}</Text>
                  </View>
                )}
                <View className="border-t border-white/10 mt-2 pt-2">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('subtotal')}</Text>
                    <Text className="text-white">{formatCurrency(fare.subtotal, language)}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('gst')}</Text>
                    <Text className="text-white">{formatCurrency(fare.gst, language)}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('qst')}</Text>
                    <Text className="text-white">{formatCurrency(fare.qst, language)}</Text>
                  </View>
                </View>
                <View className="border-t border-white/10 mt-2 pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-white font-bold text-lg">{t('total')}</Text>
                    <Text className="text-emerald-400 font-bold text-lg">
                      {formatCurrency(fare.total, language)}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Quebec Rates Info */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(350)}
            className="px-5 mb-8"
          >
            <Text className="text-white text-lg font-semibold mb-3">{t('quebecRegulations')}</Text>

            {/* Day Rate */}
            <Text className="text-amber-400 text-sm font-medium mb-2">
              {language === 'fr' ? 'Tarif de jour (5h - 23h)' : 'Day Rate (5 AM - 11 PM)'}
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{t('baseFare')}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.DAY.BASE_FARE, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Par km' : 'Per km'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.DAY.PER_KM, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Par minute (attente)' : 'Per minute (waiting)'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.DAY.PER_MINUTE_WAITING, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Tarif minimum' : 'Minimum fare'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.DAY.MINIMUM_FARE, language)}</Text>
              </View>
            </View>

            {/* Night Rate */}
            <Text className="text-blue-400 text-sm font-medium mb-2">
              {language === 'fr' ? 'Tarif de nuit (23h - 5h)' : 'Night Rate (11 PM - 5 AM)'}
            </Text>
            <View className="bg-white/5 border border-blue-500/20 rounded-2xl p-4">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{t('baseFare')}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.NIGHT.BASE_FARE, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Par km' : 'Per km'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.NIGHT.PER_KM, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Par minute (attente)' : 'Per minute (waiting)'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.NIGHT.PER_MINUTE_WAITING, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Tarif minimum' : 'Minimum fare'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.NIGHT.MINIMUM_FARE, language)}</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
