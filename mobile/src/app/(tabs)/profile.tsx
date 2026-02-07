import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Settings, ChevronRight, CreditCard, FileText, Car, Shield,
  Globe, Bell, HelpCircle, LogOut, Star, Phone, Mail, MapPin
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation, useI18n, Language } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

interface MenuItem {
  icon: any;
  label: string;
  sublabel?: string;
  color: string;
  onPress?: () => void;
}

export default function ProfileScreen() {
  const { t, language } = useTranslation();
  const setLanguage = useI18n((s) => s.setLanguage);
  const userMode = useAppStore((s) => s.userMode);

  const isDriver = userMode === 'driver';

  const handleLanguageToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const accountItems: MenuItem[] = [
    {
      icon: User,
      label: t('personalInfo'),
      sublabel: 'Jean-Pierre Tremblay',
      color: '#FFB800',
    },
    {
      icon: CreditCard,
      label: t('paymentMethods'),
      sublabel: '•••• 4242',
      color: '#3B82F6',
    },
    {
      icon: MapPin,
      label: language === 'fr' ? 'Adresses sauvegardées' : 'Saved addresses',
      sublabel: language === 'fr' ? '3 adresses' : '3 addresses',
      color: '#10B981',
    },
  ];

  const driverItems: MenuItem[] = [
    {
      icon: FileText,
      label: t('documents'),
      sublabel: language === 'fr' ? 'Tous vérifiés' : 'All verified',
      color: '#8B5CF6',
    },
    {
      icon: Car,
      label: t('vehicleInfo'),
      sublabel: 'Toyota Camry 2024',
      color: '#EC4899',
    },
    {
      icon: Shield,
      label: t('insurance'),
      sublabel: language === 'fr' ? 'Valide jusqu\'au 2026-12' : 'Valid until 2026-12',
      color: '#06B6D4',
    },
  ];

  const settingsItems: MenuItem[] = [
    {
      icon: Globe,
      label: t('language'),
      sublabel: language === 'fr' ? 'Français' : 'English',
      color: '#F59E0B',
      onPress: handleLanguageToggle,
    },
    {
      icon: Bell,
      label: language === 'fr' ? 'Notifications' : 'Notifications',
      sublabel: language === 'fr' ? 'Activées' : 'Enabled',
      color: '#EF4444',
    },
    {
      icon: HelpCircle,
      label: language === 'fr' ? 'Aide & Support' : 'Help & Support',
      color: '#6366F1',
    },
  ];

  const renderMenuSection = (title: string, items: MenuItem[]) => (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-medium mb-2 px-1">{title}</Text>
      <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={index}
              onPress={item.onPress}
              className={cn(
                'flex-row items-center p-4',
                index < items.length - 1 && 'border-b border-white/5'
              )}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: item.color + '20' }}
              >
                <Icon size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">{item.label}</Text>
                {item.sublabel && (
                  <Text className="text-gray-400 text-sm mt-0.5">{item.sublabel}</Text>
                )}
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );

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
            <Text className="text-white text-2xl font-bold">{t('profile')}</Text>
          </View>

          {/* Profile Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            className="px-5 mt-4"
          >
            <View className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <View className="flex-row items-center">
                <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center mr-4">
                  <Text className="text-white text-3xl font-bold">JP</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold">Jean-Pierre Tremblay</Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#FFB800" fill="#FFB800" />
                    <Text className="text-amber-400 font-medium ml-1">4.92</Text>
                    <Text className="text-gray-400 ml-2">
                      • {isDriver ? '1,247 ' : '89 '}
                      {language === 'fr' ? 'courses' : 'trips'}
                    </Text>
                  </View>
                  {isDriver && (
                    <View className="flex-row items-center mt-2">
                      <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Text className="text-emerald-400 text-xs font-medium">
                          {language === 'fr' ? 'Chauffeur vérifié' : 'Verified driver'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Contact Info */}
              <View className="mt-4 pt-4 border-t border-white/10">
                <View className="flex-row items-center mb-2">
                  <Phone size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">+1 (514) 555-0123</Text>
                </View>
                <View className="flex-row items-center">
                  <Mail size={14} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm ml-2">jp.tremblay@email.com</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* MTQ Permit (Driver only) */}
          {isDriver && (
            <Animated.View
              entering={FadeInDown.duration(500).delay(150)}
              className="px-5 mt-4"
            >
              <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center mr-3">
                      <Shield size={20} color="#10B981" />
                    </View>
                    <View>
                      <Text className="text-emerald-400 font-semibold">{t('taxiPermit')} 4C</Text>
                      <Text className="text-gray-400 text-sm">MTQ-2026-QC-45892</Text>
                    </View>
                  </View>
                  <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 text-sm font-medium">
                      {language === 'fr' ? 'Actif' : 'Active'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Menu Sections */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200)}
            className="px-5 mt-6"
          >
            {renderMenuSection(
              language === 'fr' ? 'Compte' : 'Account',
              accountItems
            )}

            {isDriver && renderMenuSection(
              language === 'fr' ? 'Documents chauffeur' : 'Driver documents',
              driverItems
            )}

            {renderMenuSection(
              language === 'fr' ? 'Paramètres' : 'Settings',
              settingsItems
            )}
          </Animated.View>

          {/* Language Toggle Card */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(250)}
            className="px-5 mb-4"
          >
            <Pressable
              onPress={handleLanguageToggle}
              className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mr-3">
                  <Globe size={20} color="#FFB800" />
                </View>
                <View>
                  <Text className="text-white font-medium">
                    {language === 'fr' ? 'Switch to English' : 'Passer au français'}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {language === 'fr' ? 'Langue actuelle: Français' : 'Current language: English'}
                  </Text>
                </View>
              </View>
              <View className="bg-amber-500 px-3 py-1.5 rounded-full">
                <Text className="text-black font-medium text-sm">
                  {language === 'fr' ? 'EN' : 'FR'}
                </Text>
              </View>
            </Pressable>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            className="px-5 mb-8"
          >
            <Pressable className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex-row items-center justify-center">
              <LogOut size={20} color="#EF4444" />
              <Text className="text-red-400 font-semibold ml-2">{t('logout')}</Text>
            </Pressable>
          </Animated.View>

          {/* App Version */}
          <View className="items-center mb-8">
            <Text className="text-gray-600 text-xs">QuébecTaxi v1.0.0</Text>
            <Text className="text-gray-600 text-xs mt-1">
              {language === 'fr' ? 'Conforme MTQ 2026' : 'MTQ 2026 Compliant'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
