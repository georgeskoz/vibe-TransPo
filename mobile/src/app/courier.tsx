import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Package, ChevronLeft, MapPin, Navigation, Box, Scale,
  Clock, Truck, ChevronRight, Check, AlertTriangle, Zap, Users, Percent
} from 'lucide-react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, formatDistance, QUEBEC_TAXES } from '@/lib/quebec-taxi';
import {
  calculateCourierPrice,
  getCurrentTimeOfDay,
  getSimulatedWeather,
  checkSharedDeliveryAvailability,
  type DeliverySpeed,
  type PackageSize,
  type CourierPriceBreakdown,
} from '@/lib/courier-pricing';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

interface PackageSizeOption {
  id: PackageSize;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  maxWeight: number;
  maxDimension: number;
  icon: string;
  price: number;
}

const packageSizes: PackageSizeOption[] = [
  {
    id: 'small',
    nameFr: 'Petit',
    nameEn: 'Small',
    descFr: 'Enveloppes, petits colis',
    descEn: 'Envelopes, small packages',
    maxWeight: 5,
    maxDimension: 30,
    icon: '📦',
    price: 8.99,
  },
  {
    id: 'medium',
    nameFr: 'Moyen',
    nameEn: 'Medium',
    descFr: 'Boîtes standard',
    descEn: 'Standard boxes',
    maxWeight: 15,
    maxDimension: 60,
    icon: '📦',
    price: 14.99,
  },
  {
    id: 'large',
    nameFr: 'Grand',
    nameEn: 'Large',
    descFr: 'Gros colis, équipement',
    descEn: 'Large packages, equipment',
    maxWeight: 30,
    maxDimension: 100,
    icon: '📦',
    price: 24.99,
  },
];

const deliveryOptions: {
  id: DeliverySpeed;
  nameFr: string;
  nameEn: string;
  descFr: string;
  descEn: string;
  icon: typeof Zap;
  eta: string;
  savingsLabel?: { fr: string; en: string };
}[] = [
  {
    id: 'express',
    nameFr: 'Express',
    nameEn: 'Express',
    descFr: 'Livraison en 1-2 heures',
    descEn: 'Delivery in 1-2 hours',
    icon: Zap,
    eta: '1-2h',
  },
  {
    id: 'priority',
    nameFr: 'Priorité',
    nameEn: 'Priority',
    descFr: 'Livraison en 2-4 heures',
    descEn: 'Delivery in 2-4 hours',
    icon: Truck,
    eta: '2-4h',
  },
  {
    id: 'standard',
    nameFr: 'Standard',
    nameEn: 'Standard',
    descFr: 'Livraison le même jour',
    descEn: 'Same day delivery',
    icon: Clock,
    eta: '3-5h',
  },
  {
    id: 'shared',
    nameFr: 'Partagé',
    nameEn: 'Shared',
    descFr: 'Économisez jusqu\'à 25%',
    descEn: 'Save up to 25%',
    icon: Users,
    eta: 'Flexible',
    savingsLabel: { fr: 'Jusqu\'à -25%', en: 'Up to -25%' },
  },
];

export default function CourierScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedSize, setSelectedSize] = useState<PackageSize>('small');
  const [selectedOption, setSelectedOption] = useState<DeliverySpeed>('standard');
  const [isFragile, setIsFragile] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [sharedDelivery, setSharedDelivery] = useState<{ available: boolean; partners: number; savingsPercent: number }>({
    available: false,
    partners: 0,
    savingsPercent: 0,
  });

  // Mock distance for demo
  const estimatedDistance = 8.5;

  const selectedSizeData = packageSizes.find(s => s.id === selectedSize);
  const selectedOptionData = deliveryOptions.find(o => o.id === selectedOption);

  // Check for shared delivery availability when addresses change
  useEffect(() => {
    if (pickupAddress && deliveryAddress) {
      // Simulate checking for shared delivery
      const result = checkSharedDeliveryAvailability(45.5017, -73.5673, 45.5088, -73.5878);
      setSharedDelivery(result);
    }
  }, [pickupAddress, deliveryAddress]);

  // Calculate price using new pricing algorithm
  const priceBreakdown = calculateCourierPrice({
    packageSize: selectedSize,
    distanceKm: estimatedDistance,
    deliverySpeed: selectedOption,
    isFragile,
    timeOfDay: getCurrentTimeOfDay(),
    weather: getSimulatedWeather(),
    canShareRoute: selectedOption === 'shared' && sharedDelivery.available,
    potentialSharePartners: sharedDelivery.partners,
  });

  const handleContinue = () => {
    if (!pickupAddress || !deliveryAddress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep('confirm');
  };

  const handleSendPackage = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/trip');
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#0f172a', '#1e3a5f', '#0f172a']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center">
          <Pressable
            onPress={() => step === 'confirm' ? setStep('details') : router.back()}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{t('sendPackage')}</Text>
            <Text className="text-cyan-400 text-sm">{t('courier')}</Text>
          </View>
          <View className="w-12 h-12 bg-cyan-500/20 rounded-full items-center justify-center">
            <Package size={24} color="#06B6D4" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {step === 'details' ? (
            <>
              {/* Addresses */}
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="px-5"
              >
                <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  {/* Pickup */}
                  <View className="flex-row items-center">
                    <View className="w-8 items-center">
                      <View className="w-3 h-3 rounded-full bg-cyan-500" />
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-400 text-xs mb-1">
                        {language === 'fr' ? 'Ramassage' : 'Pickup'}
                      </Text>
                      <TextInput
                        value={pickupAddress}
                        onChangeText={setPickupAddress}
                        placeholder={language === 'fr' ? 'Adresse de ramassage' : 'Pickup address'}
                        placeholderTextColor="#6B7280"
                        className="text-white text-base"
                      />
                    </View>
                    <Navigation size={20} color="#06B6D4" />
                  </View>

                  {/* Divider */}
                  <View className="flex-row items-center my-3">
                    <View className="w-8 items-center">
                      <View className="w-0.5 h-6 bg-white/20" />
                    </View>
                    <View className="flex-1 h-px bg-white/10 ml-2" />
                  </View>

                  {/* Delivery */}
                  <View className="flex-row items-center">
                    <View className="w-8 items-center">
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-400 text-xs mb-1">
                        {language === 'fr' ? 'Livraison' : 'Delivery'}
                      </Text>
                      <TextInput
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        placeholder={language === 'fr' ? 'Adresse de livraison' : 'Delivery address'}
                        placeholderTextColor="#6B7280"
                        className="text-white text-base"
                      />
                    </View>
                    <MapPin size={20} color="#F59E0B" />
                  </View>
                </View>
              </Animated.View>

              {/* Package Size */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="px-5 mt-6"
              >
                <Text className="text-white font-semibold mb-3">{t('packageSize')}</Text>
                <View className="gap-3">
                  {packageSizes.map((size, index) => {
                    const isSelected = selectedSize === size.id;
                    return (
                      <Animated.View
                        key={size.id}
                        entering={SlideInRight.duration(300).delay(index * 50)}
                      >
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setSelectedSize(size.id);
                          }}
                          className={cn(
                            'flex-row items-center p-4 rounded-2xl border',
                            isSelected
                              ? 'bg-cyan-500/10 border-cyan-500/50'
                              : 'bg-white/5 border-white/10'
                          )}
                        >
                          <View className={cn(
                            'w-14 h-14 rounded-xl items-center justify-center mr-4',
                            isSelected ? 'bg-cyan-500/20' : 'bg-white/10'
                          )}>
                            <Text className="text-3xl">{size.icon}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className={cn(
                              'font-semibold',
                              isSelected ? 'text-cyan-400' : 'text-white'
                            )}>
                              {language === 'fr' ? size.nameFr : size.nameEn}
                            </Text>
                            <Text className="text-gray-400 text-sm">
                              {language === 'fr' ? size.descFr : size.descEn}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">
                              Max {size.maxWeight}kg • {size.maxDimension}cm
                            </Text>
                          </View>
                          <View className="items-end">
                            <Text className={cn(
                              'font-bold',
                              isSelected ? 'text-cyan-400' : 'text-white'
                            )}>
                              {formatCurrency(size.price, language)}
                            </Text>
                          </View>
                          {isSelected && (
                            <View className="ml-3 w-6 h-6 bg-cyan-500 rounded-full items-center justify-center">
                              <Check size={16} color="#000" />
                            </View>
                          )}
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Delivery Speed */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(200)}
                className="px-5 mt-6"
              >
                <Text className="text-white font-semibold mb-3">
                  {language === 'fr' ? 'Vitesse de livraison' : 'Delivery speed'}
                </Text>
                <View className="flex-row gap-3">
                  {deliveryOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedOption === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedOption(option.id);
                        }}
                        className={cn(
                          'flex-1 p-4 rounded-2xl border items-center',
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500/50'
                            : 'bg-white/5 border-white/10'
                        )}
                      >
                        <View className={cn(
                          'w-10 h-10 rounded-full items-center justify-center mb-2',
                          isSelected ? 'bg-cyan-500/20' : 'bg-white/10'
                        )}>
                          <Icon size={20} color={isSelected ? '#06B6D4' : '#9CA3AF'} />
                        </View>
                        <Text className={cn(
                          'font-semibold text-sm',
                          isSelected ? 'text-cyan-400' : 'text-white'
                        )}>
                          {language === 'fr' ? option.nameFr : option.nameEn}
                        </Text>
                        {option.eta && (
                          <Text className="text-gray-400 text-xs mt-1">{option.eta}</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Fragile Toggle */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(250)}
                className="px-5 mt-6"
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsFragile(!isFragile);
                  }}
                  className={cn(
                    'flex-row items-center justify-between p-4 rounded-2xl border',
                    isFragile
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/5 border-white/10'
                  )}
                >
                  <View className="flex-row items-center">
                    <AlertTriangle size={20} color={isFragile ? '#F59E0B' : '#9CA3AF'} />
                    <View className="ml-3">
                      <Text className={cn('font-medium', isFragile ? 'text-amber-400' : 'text-white')}>
                        {t('fragile')}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        +{formatCurrency(2.99, language)}
                      </Text>
                    </View>
                  </View>
                  <View className={cn(
                    'w-12 h-7 rounded-full p-1',
                    isFragile ? 'bg-amber-500' : 'bg-gray-700'
                  )}>
                    <View className={cn(
                      'w-5 h-5 rounded-full bg-white',
                      isFragile ? 'ml-auto' : ''
                    )} />
                  </View>
                </Pressable>
              </Animated.View>

              {/* Instructions */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(300)}
                className="px-5 mt-6 mb-8"
              >
                <Text className="text-white font-semibold mb-3">
                  {language === 'fr' ? 'Instructions (optionnel)' : 'Instructions (optional)'}
                </Text>
                <TextInput
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder={language === 'fr' ? 'Instructions spéciales...' : 'Special instructions...'}
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white"
                  style={{ textAlignVertical: 'top', minHeight: 80 }}
                />
              </Animated.View>
            </>
          ) : (
            /* Confirmation Step */
            <>
              <Animated.View
                entering={FadeInDown.duration(400)}
                className="px-5"
              >
                {/* Summary Card */}
                <View className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <Text className="text-white font-semibold mb-4">
                    {language === 'fr' ? 'Résumé de la livraison' : 'Delivery Summary'}
                  </Text>

                  {/* Route */}
                  <View className="flex-row mb-4">
                    <View className="items-center mr-3">
                      <View className="w-3 h-3 rounded-full bg-cyan-500" />
                      <View className="w-0.5 h-10 bg-white/20 my-1" />
                      <View className="w-3 h-3 rounded-full bg-amber-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-400 text-xs">
                        {language === 'fr' ? 'Ramassage' : 'Pickup'}
                      </Text>
                      <Text className="text-white mb-3">{pickupAddress}</Text>
                      <Text className="text-gray-400 text-xs">
                        {language === 'fr' ? 'Livraison' : 'Delivery'}
                      </Text>
                      <Text className="text-white">{deliveryAddress}</Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View className="border-t border-white/10 pt-4 mt-2">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('packageSize')}</Text>
                      <Text className="text-white">
                        {language === 'fr' ? selectedSizeData?.nameFr : selectedSizeData?.nameEn}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">
                        {language === 'fr' ? 'Vitesse' : 'Speed'}
                      </Text>
                      <Text className="text-white">
                        {language === 'fr' ? selectedOptionData?.nameFr : selectedOptionData?.nameEn}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('distance')}</Text>
                      <Text className="text-white">{formatDistance(estimatedDistance, language)}</Text>
                    </View>
                    {isFragile && (
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-400">{t('fragile')}</Text>
                        <Text className="text-amber-400">+{formatCurrency(2.99, language)}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>

              {/* Price Breakdown */}
              <Animated.View
                entering={FadeInDown.duration(400).delay(100)}
                className="px-5 mt-4"
              >
                <View className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">
                      {language === 'fr' ? 'Frais de base' : 'Base fee'}
                    </Text>
                    <Text className="text-white">{formatCurrency(priceBreakdown.basePrice, language)}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">{t('distance')}</Text>
                    <Text className="text-white">
                      {formatCurrency(priceBreakdown.distancePrice, language)}
                    </Text>
                  </View>
                  {priceBreakdown.speedSurcharge !== 0 && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">
                        {language === 'fr' ? selectedOptionData?.nameFr : selectedOptionData?.nameEn}
                      </Text>
                      <Text className={priceBreakdown.speedSurcharge > 0 ? "text-white" : "text-emerald-400"}>
                        {priceBreakdown.speedSurcharge > 0 ? '+' : ''}{formatCurrency(priceBreakdown.speedSurcharge, language)}
                      </Text>
                    </View>
                  )}
                  {priceBreakdown.sharedDiscount > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">
                        {language === 'fr' ? 'Rabais partagé' : 'Shared discount'}
                      </Text>
                      <Text className="text-emerald-400">-{formatCurrency(priceBreakdown.sharedDiscount, language)}</Text>
                    </View>
                  )}
                  {isFragile && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">{t('fragile')}</Text>
                      <Text className="text-white">{formatCurrency(priceBreakdown.fragileFee, language)}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">{t('taxes')}</Text>
                    <Text className="text-white">{formatCurrency(priceBreakdown.totalTaxes, language)}</Text>
                  </View>
                  <View className="border-t border-cyan-500/30 pt-3 mt-2">
                    <View className="flex-row justify-between">
                      <Text className="text-white font-bold text-lg">{t('total')}</Text>
                      <Text className="text-cyan-400 font-bold text-xl">
                        {formatCurrency(priceBreakdown.total, language)}
                      </Text>
                    </View>
                    {priceBreakdown.savings > 0 && (
                      <Text className="text-emerald-400 text-sm text-right mt-1">
                        {language === 'fr' ? 'Vous économisez ' : 'You save '}{formatCurrency(priceBreakdown.savings, language)}
                      </Text>
                    )}
                  </View>
                </View>
              </Animated.View>

              <View className="h-32" />
            </>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 p-5 pb-8">
          <LinearGradient
            colors={['transparent', '#0f172a']}
            style={{ position: 'absolute', left: 0, right: 0, top: -40, bottom: 0 }}
          />
          <Pressable
            onPress={step === 'details' ? handleContinue : handleSendPackage}
            disabled={step === 'details' && (!pickupAddress || !deliveryAddress)}
            className={cn(
              'rounded-2xl overflow-hidden',
              step === 'details' && (!pickupAddress || !deliveryAddress) && 'opacity-50'
            )}
          >
            <LinearGradient
              colors={['#06B6D4', '#0891B2']}
              style={{ padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            >
              <Package size={24} color="#fff" />
              <Text className="text-white text-lg font-bold ml-3">
                {step === 'details'
                  ? (language === 'fr' ? 'Continuer' : 'Continue')
                  : `${t('sendPackage')} • ${formatCurrency(priceBreakdown.total, language)}`
                }
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
