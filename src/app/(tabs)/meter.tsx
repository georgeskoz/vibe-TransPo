import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Navigation,
  Clock,
  Car,
  Moon,
  Sun,
  Gauge
} from 'lucide-react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
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

// Meter state types
type MeterMode = 'distance' | 'waiting';

// Speed threshold below which we switch to waiting mode (km/h)
const WAITING_SPEED_THRESHOLD = QUEBEC_TAXI_RATES.WAITING_SPEED_THRESHOLD;

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
  const [meterMode, setMeterMode] = useState<MeterMode>('distance');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [isNight, setIsNight] = useState(isNightRate());

  // Refs for tracking
  const distanceRef = useRef(0);
  const waitingSecondsRef = useRef(0);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const modeIndicatorColor = useSharedValue(0);

  // Get current rates based on trip start time
  const currentRates = tripStartTime ? getCurrentRates(tripStartTime) : getCurrentRates();

  // Check night rate on mount and when meter starts
  useEffect(() => {
    const checkNightRate = () => {
      setIsNight(isNightRate());
    };
    checkNightRate();
    const interval = setInterval(checkNightRate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Pulse animation for running meter
  useEffect(() => {
    if (meterRunning && !meterPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [meterRunning, meterPaused]);

  // Mode indicator animation
  useEffect(() => {
    modeIndicatorColor.value = withTiming(meterMode === 'waiting' ? 1 : 0, { duration: 300 });
  }, [meterMode]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Calculate fare in real-time
  const updateFare = useCallback(() => {
    if (!tripStartTime) return;

    const newFare = calculateFare({
      distanceKm: distanceRef.current,
      durationMinutes: elapsedSeconds / 60,
      waitingMinutes: waitingSecondsRef.current / 60,
      isAirport,
      tripStartTime,
    });
    setFare(newFare);
  }, [elapsedSeconds, isAirport, tripStartTime]);

  // Main meter timer - updates every second
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (meterRunning && !meterPaused && meterStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - meterStartTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);

        // Simulate GPS movement (in real app, use actual GPS via expo-location)
        // Simulates Montreal traffic conditions
        const simulatedSpeed = simulateSpeed();
        setCurrentSpeed(simulatedSpeed);

        // Determine mode based on speed
        if (simulatedSpeed < WAITING_SPEED_THRESHOLD) {
          // Vehicle is stationary or in slow traffic - use waiting rate
          if (meterMode !== 'waiting') {
            setMeterMode('waiting');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          waitingSecondsRef.current += 1;
          updateMeterWaitingTime(waitingSecondsRef.current / 60);
        } else {
          // Vehicle is moving - use distance rate
          if (meterMode !== 'distance') {
            setMeterMode('distance');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          // Calculate distance based on speed (km/h to km/s * 1 second)
          const distanceIncrement = simulatedSpeed / 3600;
          distanceRef.current += distanceIncrement;
          updateMeterDistance(distanceRef.current);
        }

        // Update fare
        updateFare();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [meterRunning, meterPaused, meterStartTime, meterMode, updateFare]);

  // Simulate realistic Montreal traffic speed
  const simulateSpeed = (): number => {
    // Simulate traffic patterns
    const random = Math.random();

    if (random < 0.25) {
      // 25% chance: stopped (red light, traffic jam)
      return 0;
    } else if (random < 0.40) {
      // 15% chance: slow traffic (< 20 km/h)
      return Math.random() * 15 + 3;
    } else if (random < 0.70) {
      // 30% chance: city driving (20-40 km/h)
      return Math.random() * 20 + 20;
    } else if (random < 0.90) {
      // 20% chance: fast city driving (40-60 km/h)
      return Math.random() * 20 + 40;
    } else {
      // 10% chance: highway speed (60-100 km/h)
      return Math.random() * 40 + 60;
    }
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Record trip start time for rate determination
    const now = new Date();
    setTripStartTime(now);
    setIsNight(isNightRate(now));

    // Apply flag drop (base fare) immediately
    distanceRef.current = 0;
    waitingSecondsRef.current = 0;
    setMeterMode('distance');
    setCurrentSpeed(0);

    // Calculate initial fare with flag drop
    const initialFare = calculateFare({
      distanceKm: 0,
      durationMinutes: 0,
      waitingMinutes: 0,
      isAirport,
      tripStartTime: now,
    });
    setFare(initialFare);

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
    waitingSecondsRef.current = 0;
    setElapsedSeconds(0);
    setFare(null);
    setMeterMode('distance');
    setCurrentSpeed(0);
    setTripStartTime(null);
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

  const formatSpeed = (speed: number): string => {
    return `${Math.round(speed)} km/h`;
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
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-2xl font-bold">{t('taxiMeter')}</Text>
                <Text className="text-gray-400 mt-1">{t('mtqCompliant')}</Text>
              </View>
              {/* Day/Night Indicator */}
              <View className={cn(
                'flex-row items-center px-3 py-2 rounded-full',
                isNight ? 'bg-blue-500/20' : 'bg-amber-500/20'
              )}>
                {isNight ? (
                  <Moon size={16} color="#60A5FA" />
                ) : (
                  <Sun size={16} color="#FBBF24" />
                )}
                <Text className={cn(
                  'text-xs font-medium ml-2',
                  isNight ? 'text-blue-400' : 'text-amber-400'
                )}>
                  {isNight
                    ? (language === 'fr' ? 'Tarif nuit' : 'Night rate')
                    : (language === 'fr' ? 'Tarif jour' : 'Day rate')
                  }
                </Text>
              </View>
            </View>
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
              {/* Mode Indicator */}
              {meterRunning && (
                <View className="flex-row justify-center mb-4">
                  <View className={cn(
                    'flex-row items-center px-4 py-2 rounded-full',
                    meterMode === 'distance' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  )}>
                    {meterMode === 'distance' ? (
                      <Car size={16} color="#10B981" />
                    ) : (
                      <Clock size={16} color="#F59E0B" />
                    )}
                    <Text className={cn(
                      'text-sm font-medium ml-2',
                      meterMode === 'distance' ? 'text-emerald-400' : 'text-amber-400'
                    )}>
                      {meterMode === 'distance'
                        ? (language === 'fr' ? 'Distance' : 'Distance')
                        : (language === 'fr' ? 'Attente' : 'Waiting')
                      }
                    </Text>
                    <Text className="text-gray-500 text-xs ml-2">
                      {meterMode === 'distance'
                        ? `${formatCurrency(currentRates.PER_KM, language)}/km`
                        : `${formatCurrency(currentRates.PER_MINUTE_WAITING, language)}/min`
                      }
                    </Text>
                  </View>
                </View>
              )}

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
                {/* Flag Drop Indicator */}
                {fare && !meterRunning && fare.baseFare > 0 && (
                  <Text className="text-gray-500 text-xs mt-1">
                    {language === 'fr' ? 'Prise en charge incluse' : 'Flag drop included'}
                  </Text>
                )}
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
                    <Gauge size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-xs ml-1">
                      {language === 'fr' ? 'Vitesse' : 'Speed'}
                    </Text>
                  </View>
                  <Text className={cn(
                    'text-xl font-semibold font-mono',
                    currentSpeed < WAITING_SPEED_THRESHOLD ? 'text-amber-400' : 'text-white'
                  )}>
                    {formatSpeed(currentSpeed)}
                  </Text>
                </View>
              </View>

              {/* Waiting Time Display */}
              {waitingSecondsRef.current > 0 && (
                <View className="bg-amber-500/10 rounded-xl p-3 mt-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Clock size={16} color="#F59E0B" />
                      <Text className="text-amber-400 text-sm ml-2">
                        {language === 'fr' ? 'Temps d\'attente' : 'Waiting time'}
                      </Text>
                    </View>
                    <Text className="text-amber-400 font-mono font-semibold">
                      {formatDuration(meterWaitingTime, language)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Status Indicator */}
              {meterRunning && (
                <View className={cn(
                  'flex-row items-center justify-center py-2 rounded-full mt-4',
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
            <View className="flex-row" style={{ gap: 12 }}>
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
                {/* Flag Drop / Base Fare */}
                <View className="flex-row justify-between py-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-400">{t('baseFare')}</Text>
                    <Text className="text-gray-500 text-xs ml-2">
                      ({language === 'fr' ? 'Prise en charge' : 'Flag drop'})
                    </Text>
                  </View>
                  <Text className="text-white">{formatCurrency(fare.baseFare, language)}</Text>
                </View>

                {/* Distance Fare */}
                <View className="flex-row justify-between py-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-400">{t('distanceFare')}</Text>
                    <Text className="text-gray-500 text-xs ml-2">
                      ({formatDistance(meterDistance, language)})
                    </Text>
                  </View>
                  <Text className="text-white">{formatCurrency(fare.distanceFare, language)}</Text>
                </View>

                {/* Waiting Time Fare */}
                <View className="flex-row justify-between py-2">
                  <View className="flex-row items-center">
                    <Text className="text-gray-400">{t('waitingTime')}</Text>
                    <Text className="text-gray-500 text-xs ml-2">
                      ({formatDuration(meterWaitingTime, language)})
                    </Text>
                  </View>
                  <Text className="text-white">{formatCurrency(fare.waitingFare, language)}</Text>
                </View>

                {/* Airport Surcharge */}
                {fare.airportSurcharge > 0 && (
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">
                      {language === 'fr' ? 'Supplément aéroport' : 'Airport surcharge'}
                    </Text>
                    <Text className="text-white">{formatCurrency(fare.airportSurcharge, language)}</Text>
                  </View>
                )}

                {/* Regulatory Fee */}
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-400">
                    {language === 'fr' ? 'Frais réglementaires' : 'Regulatory fee'}
                  </Text>
                  <Text className="text-white">{formatCurrency(fare.regulatoryFee, language)}</Text>
                </View>

                <View className="border-t border-white/10 mt-2 pt-2">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('subtotal')}</Text>
                    <Text className="text-white">{formatCurrency(fare.subtotal, language)}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('gst')} (5%)</Text>
                    <Text className="text-white">{formatCurrency(fare.gst, language)}</Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-gray-400">{t('qst')} (9.975%)</Text>
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

            {/* Current Active Rate Highlight */}
            <View className={cn(
              'p-3 rounded-xl mb-4',
              isNight ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-amber-500/10 border border-amber-500/20'
            )}>
              <Text className={cn(
                'text-sm font-medium text-center',
                isNight ? 'text-blue-400' : 'text-amber-400'
              )}>
                {isNight
                  ? (language === 'fr' ? '🌙 Tarif de nuit actuellement en vigueur' : '🌙 Night rate currently active')
                  : (language === 'fr' ? '☀️ Tarif de jour actuellement en vigueur' : '☀️ Day rate currently active')
                }
              </Text>
            </View>

            {/* Day Rate */}
            <Text className="text-amber-400 text-sm font-medium mb-2">
              {language === 'fr' ? 'Tarif de jour (5h - 23h)' : 'Day Rate (5 AM - 11 PM)'}
            </Text>
            <View className={cn(
              'bg-white/5 rounded-2xl p-4 mb-4',
              !isNight ? 'border-2 border-amber-500/30' : 'border border-white/10'
            )}>
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
            <View className={cn(
              'bg-white/5 rounded-2xl p-4',
              isNight ? 'border-2 border-blue-500/30' : 'border border-white/10'
            )}>
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

            {/* Additional Fees */}
            <Text className="text-gray-400 text-sm font-medium mt-4 mb-2">
              {language === 'fr' ? 'Frais additionnels' : 'Additional fees'}
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Supplément aéroport' : 'Airport surcharge'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.AIRPORT_SURCHARGE, language)}</Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-400">{language === 'fr' ? 'Frais réglementaires' : 'Regulatory fee'}</Text>
                <Text className="text-white">{formatCurrency(QUEBEC_TAXI_RATES.REGULATORY_FEE, language)}</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
