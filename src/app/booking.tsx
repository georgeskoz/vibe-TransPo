import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  MapPin, Navigation, Search, Clock, Star, ChevronLeft,
  Car, Sparkles, Accessibility, Users, X, Check
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { estimateFare, formatCurrency, formatDistance, formatDuration } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

const savedPlaces = [
  { id: '1', name: 'Maison', address: '1234 Rue Saint-Denis, Montréal', icon: '🏠' },
  { id: '2', name: 'Travail', address: '800 Rue de la Gauchetière, Montréal', icon: '💼' },
];

const recentSearches = [
  { id: '1', address: 'Aéroport Montréal-Trudeau (YUL)', distance: 22 },
  { id: '2', address: 'Centre Bell, Montréal', distance: 3 },
  { id: '3', address: 'Vieux-Port de Montréal', distance: 5 },
  { id: '4', address: 'Mont-Royal, Montréal', distance: 4 },
];

interface RideType {
  id: string;
  name: string;
  nameEn: string;
  icon: any;
  multiplier: number;
  eta: number;
  description: string;
  descriptionEn: string;
}

const rideTypes: RideType[] = [
  {
    id: 'standard',
    name: 'Standard',
    nameEn: 'Standard',
    icon: Car,
    multiplier: 1,
    eta: 4,
    description: '4 places, économique',
    descriptionEn: '4 seats, economical',
  },
  {
    id: 'premium',
    name: 'Premium',
    nameEn: 'Premium',
    icon: Sparkles,
    multiplier: 1.5,
    eta: 6,
    description: 'Véhicule haut de gamme',
    descriptionEn: 'Luxury vehicle',
  },
  {
    id: 'accessible',
    name: 'Accessible',
    nameEn: 'Accessible',
    icon: Accessibility,
    multiplier: 1,
    eta: 8,
    description: 'Adapté fauteuil roulant',
    descriptionEn: 'Wheelchair accessible',
  },
  {
    id: 'xl',
    name: 'XL',
    nameEn: 'XL',
    icon: Users,
    multiplier: 1.3,
    eta: 7,
    description: '6+ places',
    descriptionEn: '6+ seats',
  },
];

export default function BookingScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const serviceType = useAppStore((s) => s.serviceType);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [step, setStep] = useState<'search' | 'select'>('search');
  const [selectedDestination, setSelectedDestination] = useState<{ address: string; distance: number } | null>(null);

  const handleSelectDestination = (address: string, distance: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDestination(address);
    setSelectedDestination({ address, distance });
    setStep('select');
  };

  const handleBack = () => {
    if (step === 'select') {
      setStep('search');
      setSelectedDestination(null);
    } else {
      router.back();
    }
  };

  const handleBookRide = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Navigate to trip tracking screen
    router.push('/trip');
  };

  const selectedType = rideTypes.find(r => r.id === selectedRideType);
  const baseFare = selectedDestination
    ? estimateFare(selectedDestination.distance, selectedDestination.distance * 2)
    : null;
  const finalFare = baseFare && selectedType
    ? { ...baseFare, total: baseFare.total * selectedType.multiplier }
    : null;

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-4 flex-row items-center">
            <Pressable
              onPress={handleBack}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3"
            >
              <ChevronLeft size={24} color="#fff" />
            </Pressable>
            <View>
              <Text className="text-white text-xl font-bold">
                {step === 'search' ? t('whereToGo') : t('selectService')}
              </Text>
              <Text className="text-gray-400 text-sm">{t(serviceType)}</Text>
            </View>
          </View>

          {step === 'search' ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Location Inputs */}
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="px-5"
              >
                <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  {/* Pickup */}
                  <View className="flex-row items-center">
                    <View className="w-8 items-center">
                      <View className="w-3 h-3 rounded-full bg-emerald-500" />
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-400 text-xs mb-1">{t('pickupLocation')}</Text>
                      <TextInput
                        value={pickup}
                        onChangeText={setPickup}
                        placeholder={t('currentLocation')}
                        placeholderTextColor="#6B7280"
                        className="text-white text-base"
                      />
                    </View>
                    {pickup ? (
                      <Pressable onPress={() => setPickup('')}>
                        <X size={20} color="#6B7280" />
                      </Pressable>
                    ) : (
                      <Navigation size={20} color="#10B981" />
                    )}
                  </View>

                  {/* Divider with dots */}
                  <View className="flex-row items-center my-3">
                    <View className="w-8 items-center">
                      <View className="w-0.5 h-6 bg-white/20" />
                    </View>
                    <View className="flex-1 h-px bg-white/10 ml-2" />
                  </View>

                  {/* Destination */}
                  <View className="flex-row items-center">
                    <View className="w-8 items-center">
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-400 text-xs mb-1">{t('destination')}</Text>
                      <TextInput
                        value={destination}
                        onChangeText={setDestination}
                        placeholder={t('whereToGo')}
                        placeholderTextColor="#6B7280"
                        className="text-white text-base"
                        autoFocus
                      />
                    </View>
                    {destination && (
                      <Pressable onPress={() => setDestination('')}>
                        <X size={20} color="#6B7280" />
                      </Pressable>
                    )}
                  </View>
                </View>
              </Animated.View>

              {/* Saved Places */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="px-5 mt-6"
              >
                <Text className="text-white font-semibold mb-3">
                  {language === 'fr' ? 'Lieux sauvegardés' : 'Saved places'}
                </Text>
                <View className="flex-row gap-3">
                  {savedPlaces.map((place) => (
                    <Pressable
                      key={place.id}
                      onPress={() => handleSelectDestination(place.address, 5)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3"
                    >
                      <Text className="text-2xl mb-2">{place.icon}</Text>
                      <Text className="text-white font-medium">{place.name}</Text>
                      <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                        {place.address}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>

              {/* Recent Searches */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="px-5 mt-6 mb-8"
              >
                <Text className="text-white font-semibold mb-3">
                  {language === 'fr' ? 'Recherches récentes' : 'Recent searches'}
                </Text>
                <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  {recentSearches.map((search, index) => (
                    <Pressable
                      key={search.id}
                      onPress={() => handleSelectDestination(search.address, search.distance)}
                      className={cn(
                        'flex-row items-center p-4',
                        index < recentSearches.length - 1 && 'border-b border-white/5'
                      )}
                    >
                      <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3">
                        <Clock size={18} color="#9CA3AF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white" numberOfLines={1}>{search.address}</Text>
                        <Text className="text-gray-400 text-sm mt-0.5">
                          {formatDistance(search.distance, language)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            </ScrollView>
          ) : (
            /* Ride Selection */
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Trip Summary */}
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="px-5"
              >
                <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <View className="flex-row">
                    <View className="items-center mr-3">
                      <View className="w-3 h-3 rounded-full bg-emerald-500" />
                      <View className="w-0.5 h-8 bg-white/20 my-1" />
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-400 text-xs">{t('pickupLocation')}</Text>
                      <Text className="text-white mb-3">{pickup || t('currentLocation')}</Text>
                      <Text className="text-gray-400 text-xs">{t('destination')}</Text>
                      <Text className="text-white">{selectedDestination?.address}</Text>
                    </View>
                  </View>
                  <View className="flex-row mt-4 pt-4 border-t border-white/10">
                    <Text className="text-gray-400 flex-1">
                      {formatDistance(selectedDestination?.distance || 0, language)}
                    </Text>
                    <Text className="text-gray-400">
                      ~{formatDuration((selectedDestination?.distance || 0) * 2, language)}
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Ride Types */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="px-5 mt-6"
              >
                <Text className="text-white font-semibold mb-3">
                  {language === 'fr' ? 'Choisir votre course' : 'Choose your ride'}
                </Text>
                <View className="gap-3">
                  {rideTypes.map((type, index) => {
                    const Icon = type.icon;
                    const isSelected = selectedRideType === type.id;
                    const typeFare = baseFare ? baseFare.total * type.multiplier : 0;

                    return (
                      <Animated.View
                        key={type.id}
                        entering={SlideInRight.duration(300).delay(index * 50)}
                      >
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedRideType(type.id);
                          }}
                          className={cn(
                            'flex-row items-center p-4 rounded-2xl border',
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500/50'
                              : 'bg-white/5 border-white/10'
                          )}
                        >
                          <View className={cn(
                            'w-12 h-12 rounded-full items-center justify-center mr-4',
                            isSelected ? 'bg-amber-500/20' : 'bg-white/10'
                          )}>
                            <Icon size={24} color={isSelected ? '#FFB800' : '#9CA3AF'} />
                          </View>
                          <View className="flex-1">
                            <Text className={cn(
                              'font-semibold',
                              isSelected ? 'text-amber-400' : 'text-white'
                            )}>
                              {language === 'fr' ? type.name : type.nameEn}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                              {language === 'fr' ? type.description : type.descriptionEn}
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className={cn(
                              'font-bold',
                              isSelected ? 'text-amber-400' : 'text-white'
                            )}>
                              {formatCurrency(typeFare, language)}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                              {type.eta} min
                            </Text>
                          </View>
                          {isSelected && (
                            <View className="ml-3 w-6 h-6 bg-amber-500 rounded-full items-center justify-center">
                              <Check size={16} color="#000" />
                            </View>
                          )}
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Fare Breakdown */}
              {finalFare && (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(200)}
                  className="px-5 mt-6 mb-4"
                >
                  <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <Text className="text-white font-semibold mb-3">{t('estimatedFare')}</Text>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('baseFare')}</Text>
                      <Text className="text-white">{formatCurrency(baseFare?.baseFare || 0, language)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('distanceFare')}</Text>
                      <Text className="text-white">{formatCurrency(baseFare?.distanceFare || 0, language)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('taxes')}</Text>
                      <Text className="text-white">{formatCurrency(baseFare?.totalTaxes || 0, language)}</Text>
                    </View>
                    {selectedType && selectedType.multiplier > 1 && (
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">
                          {language === 'fr' ? 'Supplément' : 'Surcharge'} ({selectedType.name})
                        </Text>
                        <Text className="text-white">
                          +{formatCurrency((baseFare?.total || 0) * (selectedType.multiplier - 1), language)}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row justify-between pt-3 mt-2 border-t border-white/10">
                      <Text className="text-white font-bold">{t('total')}</Text>
                      <Text className="text-amber-400 font-bold text-lg">
                        {formatCurrency(finalFare.total, language)}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}

              <View className="h-24" />
            </ScrollView>
          )}

          {/* Book Button (fixed at bottom) */}
          {step === 'select' && (
            <Animated.View
              entering={FadeInUp.duration(400)}
              className="absolute bottom-0 left-0 right-0 p-5 pb-8"
            >
              <LinearGradient
                colors={['transparent', '#0f0f23']}
                style={{ position: 'absolute', left: 0, right: 0, top: -40, bottom: 0 }}
              />
              <Pressable
                onPress={handleBookRide}
                className="rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#FFB800', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <Car size={24} color="#000" />
                  <Text className="text-black text-lg font-bold ml-3">
                    {t('bookRide')} • {finalFare ? formatCurrency(finalFare.total, language) : ''}
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
