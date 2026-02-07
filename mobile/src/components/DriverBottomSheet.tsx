import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Settings, List, LogOut, FileText, TrendingUp, User, HelpCircle } from 'lucide-react-native';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DriverBottomSheetProps {
  onLogout?: () => void;
}

export function DriverBottomSheet({ onLogout }: DriverBottomSheetProps) {
  const { language } = useTranslation();
  const setUserMode = useAppStore((s) => s.setUserMode);
  const todayEarnings = useAppStore((s) => s.todayEarnings);

  const snapPoints = useMemo(() => [60, 250, '90%'], []);

  const handleLogout = useCallback(() => {
    setUserMode('rider');
    onLogout?.();
  }, [setUserMode, onLogout]);

  return (
    <BottomSheet
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: '#fff', height: 4, width: 40 }}
      backgroundStyle={{ backgroundColor: 'transparent' }}
      enablePanDownToClose={false}
    >
      {/* Glass Blur Effect Background */}
      <BlurView intensity={85} style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
        <View className="flex-1 px-5 pt-4">
          {/* Always Visible - Online Status Header */}
          <View className="pb-4 border-b border-white/20 mb-4">
            <View className="flex-row items-center justify-between">
              {/* Settings Icon */}
              <Pressable
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                onPress={() => {}}
              >
                <Settings size={20} color="#fff" strokeWidth={2} />
              </Pressable>

              {/* Online Status */}
              <View className="flex-1 items-center">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-emerald-400" />
                  <Text className="text-white text-lg font-bold">
                    {language === 'fr' ? 'En ligne' : 'You\'re online'}
                  </Text>
                </View>
              </View>

              {/* List Icon */}
              <Pressable
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                onPress={() => {}}
              >
                <List size={20} color="#fff" strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Expandable Content - Earnings Summary */}
          <Animated.View
            entering={FadeIn.duration(300)}
            className="mb-8"
          >
            <Text className="text-white text-xs font-semibold uppercase tracking-wide mb-3">
              {language === 'fr' ? 'Aujourd\'hui' : 'Today'}
            </Text>
            <View className="bg-white/20 rounded-2xl p-4">
              <Text className="text-white/70 text-sm mb-1">
                {language === 'fr' ? 'Revenus' : 'Earnings'}
              </Text>
              <Text className="text-white text-3xl font-bold">
                ${todayEarnings.toFixed(2)}
              </Text>
            </View>
          </Animated.View>

          {/* Menu Grid */}
          <Animated.View
            entering={FadeIn.duration(400)}
            className="mb-8"
          >
            <Text className="text-white text-xs font-semibold uppercase tracking-wide mb-3">
              {language === 'fr' ? 'Menu' : 'Menu'}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {/* Documents */}
              <Pressable
                className="flex-1 min-w-[45%] bg-white/20 rounded-2xl p-4 items-center"
                onPress={() => {}}
              >
                <View className="w-10 h-10 bg-blue-500/30 rounded-full items-center justify-center mb-2">
                  <FileText size={20} color="#60A5FA" strokeWidth={2} />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {language === 'fr' ? 'Documents' : 'Documents'}
                </Text>
              </Pressable>

              {/* Earnings History */}
              <Pressable
                className="flex-1 min-w-[45%] bg-white/20 rounded-2xl p-4 items-center"
                onPress={() => {}}
              >
                <View className="w-10 h-10 bg-green-500/30 rounded-full items-center justify-center mb-2">
                  <TrendingUp size={20} color="#34D399" strokeWidth={2} />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {language === 'fr' ? 'Historique' : 'History'}
                </Text>
              </Pressable>

              {/* Profile */}
              <Pressable
                className="flex-1 min-w-[45%] bg-white/20 rounded-2xl p-4 items-center"
                onPress={() => {}}
              >
                <View className="w-10 h-10 bg-amber-500/30 rounded-full items-center justify-center mb-2">
                  <User size={20} color="#FBBF24" strokeWidth={2} />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {language === 'fr' ? 'Profil' : 'Profile'}
                </Text>
              </Pressable>

              {/* Support */}
              <Pressable
                className="flex-1 min-w-[45%] bg-white/20 rounded-2xl p-4 items-center"
                onPress={() => {}}
              >
                <View className="w-10 h-10 bg-purple-500/30 rounded-full items-center justify-center mb-2">
                  <HelpCircle size={20} color="#A78BFA" strokeWidth={2} />
                </View>
                <Text className="text-white text-sm font-medium text-center">
                  {language === 'fr' ? 'Support' : 'Support'}
                </Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View
            entering={FadeIn.duration(500)}
            className="mb-8"
          >
            <Pressable
              onPress={handleLogout}
              className="bg-red-500/80 rounded-2xl py-4 items-center"
            >
              <View className="flex-row items-center gap-2">
                <LogOut size={20} color="#fff" strokeWidth={2} />
                <Text className="text-white font-semibold text-lg">
                  {language === 'fr' ? 'Déconnexion' : 'Logout'}
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </BlurView>
    </BottomSheet>
  );
}
