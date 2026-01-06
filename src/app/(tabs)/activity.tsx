import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, Car, ChevronRight, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, formatDistance, formatDuration } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';

interface TripHistoryItem {
  id: string;
  date: Date;
  pickup: string;
  destination: string;
  distance: number;
  duration: number;
  fare: number;
  status: 'completed' | 'cancelled';
}

const mockTrips: TripHistoryItem[] = [
  {
    id: '1',
    date: new Date(2026, 0, 6, 14, 30),
    pickup: '1000 Rue Sherbrooke O',
    destination: 'Aéroport YUL',
    distance: 22.5,
    duration: 35,
    fare: 68.45,
    status: 'completed',
  },
  {
    id: '2',
    date: new Date(2026, 0, 5, 9, 15),
    pickup: '200 Rue Sainte-Catherine E',
    destination: 'Centre Bell',
    distance: 3.2,
    duration: 12,
    fare: 15.80,
    status: 'completed',
  },
  {
    id: '3',
    date: new Date(2026, 0, 4, 18, 0),
    pickup: 'Vieux-Port de Montréal',
    destination: '5000 Avenue du Parc',
    distance: 5.8,
    duration: 18,
    fare: 22.35,
    status: 'completed',
  },
  {
    id: '4',
    date: new Date(2026, 0, 3, 12, 45),
    pickup: 'McGill University',
    destination: 'Quartier Latin',
    distance: 2.1,
    duration: 8,
    fare: 12.50,
    status: 'cancelled',
  },
];

function formatDate(date: Date, language: 'fr' | 'en'): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', options);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-CA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function ActivityScreen() {
  const { t, language } = useTranslation();

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4">
          <Text className="text-white text-2xl font-bold">{t('activity')}</Text>
          <Text className="text-gray-400 mt-1">
            {language === 'fr' ? 'Historique de vos courses' : 'Your trip history'}
          </Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Stats Summary */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mb-6"
          >
            <View className="flex-row gap-3">
              <View className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <Text className="text-amber-400 text-sm">
                  {language === 'fr' ? 'Ce mois' : 'This month'}
                </Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {formatCurrency(118.10, language)}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">4 {language === 'fr' ? 'courses' : 'trips'}</Text>
              </View>
              <View className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4">
                <Text className="text-gray-400 text-sm">
                  {language === 'fr' ? 'Distance totale' : 'Total distance'}
                </Text>
                <Text className="text-white text-2xl font-bold mt-1">
                  {formatDistance(33.6, language)}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  {formatDuration(73, language)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Trip List */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5"
          >
            <Text className="text-white text-lg font-semibold mb-3">{t('tripHistory')}</Text>

            {mockTrips.length === 0 ? (
              <View className="bg-white/5 border border-white/10 rounded-2xl p-8 items-center">
                <Clock size={48} color="#6B7280" />
                <Text className="text-gray-400 mt-4 text-center">{t('noTrips')}</Text>
              </View>
            ) : (
              <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {mockTrips.map((trip, index) => (
                  <Pressable
                    key={trip.id}
                    className={cn(
                      'p-4',
                      index < mockTrips.length - 1 && 'border-b border-white/5'
                    )}
                  >
                    {/* Date & Time Header */}
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">
                          {formatDate(trip.date, language)} • {formatTime(trip.date)}
                        </Text>
                      </View>
                      <View className={cn(
                        'px-2 py-1 rounded-full',
                        trip.status === 'completed' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      )}>
                        <Text className={cn(
                          'text-xs font-medium',
                          trip.status === 'completed' ? 'text-emerald-400' : 'text-red-400'
                        )}>
                          {trip.status === 'completed'
                            ? (language === 'fr' ? 'Complétée' : 'Completed')
                            : (language === 'fr' ? 'Annulée' : 'Cancelled')}
                        </Text>
                      </View>
                    </View>

                    {/* Trip Route */}
                    <View className="flex-row">
                      <View className="items-center mr-3">
                        <View className="w-3 h-3 rounded-full bg-emerald-500" />
                        <View className="w-0.5 h-8 bg-white/20 my-1" />
                        <View className="w-3 h-3 rounded-full bg-amber-500" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white text-sm" numberOfLines={1}>
                          {trip.pickup}
                        </Text>
                        <View className="h-8" />
                        <Text className="text-white text-sm" numberOfLines={1}>
                          {trip.destination}
                        </Text>
                      </View>
                    </View>

                    {/* Trip Stats */}
                    <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <View className="flex-row items-center gap-4">
                        <Text className="text-gray-400 text-sm">
                          {formatDistance(trip.distance, language)}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          {formatDuration(trip.duration, language)}
                        </Text>
                      </View>
                      <Text className="text-white font-bold">
                        {formatCurrency(trip.fare, language)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
