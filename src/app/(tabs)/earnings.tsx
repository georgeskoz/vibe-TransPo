import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TrendingUp, Calendar, CreditCard, Building2, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';

interface EarningsDay {
  date: string;
  trips: number;
  gross: number;
  net: number;
}

const weeklyData: EarningsDay[] = [
  { date: '2026-01-06', trips: 8, gross: 245.50, net: 196.40 },
  { date: '2026-01-05', trips: 12, gross: 389.20, net: 311.36 },
  { date: '2026-01-04', trips: 6, gross: 178.90, net: 143.12 },
  { date: '2026-01-03', trips: 10, gross: 312.00, net: 249.60 },
  { date: '2026-01-02', trips: 9, gross: 287.65, net: 230.12 },
  { date: '2026-01-01', trips: 4, gross: 145.00, net: 116.00 },
  { date: '2025-12-31', trips: 11, gross: 356.80, net: 285.44 },
];

const formatDay = (dateStr: string, language: 'fr' | 'en'): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' };
  return date.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', options);
};

export default function EarningsScreen() {
  const { t, language } = useTranslation();
  const weeklyEarnings = useAppStore((s) => s.weeklyEarnings);
  const pendingPayout = useAppStore((s) => s.pendingPayout);

  const totalGross = weeklyData.reduce((sum, day) => sum + day.gross, 0);
  const totalNet = weeklyData.reduce((sum, day) => sum + day.net, 0);
  const totalTrips = weeklyData.reduce((sum, day) => sum + day.trips, 0);
  const maxGross = Math.max(...weeklyData.map(d => d.gross));

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-5 pt-4 pb-2">
            <Text className="text-white text-2xl font-bold">{t('earnings')}</Text>
            <Text className="text-gray-400 mt-1">
              {language === 'fr' ? 'Suivi de vos revenus' : 'Track your income'}
            </Text>
          </View>

          {/* Main Earnings Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mt-4"
          >
            <LinearGradient
              colors={['#FFB800', '#FF8C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 24 }}
            >
              <Text className="text-white/80 text-sm font-medium">
                {t('weeklyEarnings')}
              </Text>
              <Text className="text-white text-4xl font-bold mt-2">
                {formatCurrency(totalNet, language)}
              </Text>
              <View className="flex-row items-center mt-2">
                <ArrowUpRight size={16} color="#fff" />
                <Text className="text-white/90 text-sm ml-1">
                  +12% {language === 'fr' ? 'vs semaine dernière' : 'vs last week'}
                </Text>
              </View>

              <View className="flex-row mt-6 gap-4">
                <View className="flex-1 bg-white/20 rounded-xl p-3">
                  <Text className="text-white/70 text-xs">{language === 'fr' ? 'Brut' : 'Gross'}</Text>
                  <Text className="text-white font-bold mt-1">
                    {formatCurrency(totalGross, language)}
                  </Text>
                </View>
                <View className="flex-1 bg-white/20 rounded-xl p-3">
                  <Text className="text-white/70 text-xs">{language === 'fr' ? 'Courses' : 'Trips'}</Text>
                  <Text className="text-white font-bold mt-1">{totalTrips}</Text>
                </View>
                <View className="flex-1 bg-white/20 rounded-xl p-3">
                  <Text className="text-white/70 text-xs">{language === 'fr' ? 'Moyenne' : 'Average'}</Text>
                  <Text className="text-white font-bold mt-1">
                    {formatCurrency(totalGross / totalTrips, language)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Payout Section */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5 mt-6"
          >
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-emerald-400 text-sm">{t('pendingPayout')}</Text>
                    <Text className="text-white text-xl font-bold mt-1">
                      {formatCurrency(totalNet, language)}
                    </Text>
                  </View>
                  <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center">
                    <Building2 size={20} color="#10B981" />
                  </View>
                </View>
                <Text className="text-gray-400 text-xs mt-2">
                  {language === 'fr' ? 'Prochain dépôt: Vendredi' : 'Next deposit: Friday'}
                </Text>
              </Pressable>

              <Pressable className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-blue-400 text-sm">Square</Text>
                    <Text className="text-white text-xl font-bold mt-1">
                      {language === 'fr' ? 'Connecté' : 'Connected'}
                    </Text>
                  </View>
                  <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center">
                    <CreditCard size={20} color="#3B82F6" />
                  </View>
                </View>
                <Text className="text-gray-400 text-xs mt-2">
                  {language === 'fr' ? 'Paiements activés' : 'Payments enabled'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Weekly Chart */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="px-5 mt-6"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              {language === 'fr' ? 'Cette semaine' : 'This week'}
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <View className="flex-row items-end justify-between h-32">
                {weeklyData.map((day, index) => {
                  const height = (day.gross / maxGross) * 100;
                  const isToday = index === 0;
                  return (
                    <View key={day.date} className="items-center flex-1">
                      <Text className="text-gray-400 text-xs mb-2">
                        {formatCurrency(day.gross, language).replace('$', '').replace(' $', '')}
                      </Text>
                      <View
                        className={cn(
                          'w-8 rounded-t-lg',
                          isToday ? 'bg-amber-500' : 'bg-white/20'
                        )}
                        style={{ height: `${height}%`, minHeight: 8 }}
                      />
                      <Text className={cn(
                        'text-xs mt-2',
                        isToday ? 'text-amber-400 font-medium' : 'text-gray-500'
                      )}>
                        {formatDay(day.date, language).split(' ')[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>

          {/* Daily Breakdown */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(400)}
            className="px-5 mt-6 mb-8"
          >
            <Text className="text-white text-lg font-semibold mb-3">
              {language === 'fr' ? 'Détails par jour' : 'Daily breakdown'}
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {weeklyData.map((day, index) => (
                <Pressable
                  key={day.date}
                  className={cn(
                    'flex-row items-center justify-between p-4',
                    index < weeklyData.length - 1 && 'border-b border-white/5'
                  )}
                >
                  <View>
                    <Text className="text-white font-medium">
                      {formatDay(day.date, language)}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-0.5">
                      {day.trips} {language === 'fr' ? 'courses' : 'trips'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">
                      {formatCurrency(day.net, language)}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-0.5">
                      {language === 'fr' ? 'brut: ' : 'gross: '}
                      {formatCurrency(day.gross, language)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Direct Deposit Setup */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(450)}
            className="px-5 mb-8"
          >
            <Pressable className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center">
              <View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center mr-4">
                <Building2 size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">{t('directDeposit')}</Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  {language === 'fr' ? 'Configuré • TD Canada Trust' : 'Configured • TD Canada Trust'}
                </Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
