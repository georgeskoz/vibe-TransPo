import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Phone, User, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const { language } = useTranslation();
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordsMatch = password === confirmPassword && password.length >= 8;
  const isFormValid = firstName && lastName && email && password && passwordsMatch && acceptTerms;

  const handleRegister = async () => {
    if (!isFormValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await register({
      email,
      password,
      firstName,
      lastName,
      phone: phone || undefined,
    });

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-5 pt-4 flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
            >
              <ChevronLeft size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-xl font-bold ml-4">
              {language === 'fr' ? 'Créer un compte' : 'Create Account'}
            </Text>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name Fields */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              className="flex-row gap-3 mb-4"
            >
              <View className="flex-1">
                <Text className="text-gray-400 text-sm mb-2">
                  {language === 'fr' ? 'Prénom' : 'First name'}
                </Text>
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                  <User size={20} color="#9CA3AF" />
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Jean"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="words"
                    className="flex-1 text-white py-4 ml-3"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-sm mb-2">
                  {language === 'fr' ? 'Nom' : 'Last name'}
                </Text>
                <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Tremblay"
                    placeholderTextColor="#6B7280"
                    autoCapitalize="words"
                    className="flex-1 text-white py-4"
                  />
                </View>
              </View>
            </Animated.View>

            {/* Email */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(150)}
              className="mb-4"
            >
              <Text className="text-gray-400 text-sm mb-2">
                {language === 'fr' ? 'Adresse courriel' : 'Email address'}
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nom@exemple.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 text-white py-4 ml-3"
                />
              </View>
            </Animated.View>

            {/* Phone (Optional) */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="mb-4"
            >
              <Text className="text-gray-400 text-sm mb-2">
                {language === 'fr' ? 'Téléphone (optionnel)' : 'Phone (optional)'}
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                <View className="flex-row items-center pr-3 border-r border-white/10">
                  <Text className="text-white">+1</Text>
                </View>
                <Phone size={20} color="#9CA3AF" className="ml-3" />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="(514) 555-0123"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  className="flex-1 text-white py-4 ml-3"
                />
              </View>
            </Animated.View>

            {/* Password */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(250)}
              className="mb-4"
            >
              <Text className="text-gray-400 text-sm mb-2">
                {language === 'fr' ? 'Mot de passe' : 'Password'}
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 text-white py-4 ml-3"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </Pressable>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                {language === 'fr' ? 'Minimum 8 caractères' : 'Minimum 8 characters'}
              </Text>
            </Animated.View>

            {/* Confirm Password */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="mb-6"
            >
              <Text className="text-gray-400 text-sm mb-2">
                {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
              </Text>
              <View className={cn(
                'flex-row items-center bg-white/5 rounded-xl px-4 border',
                confirmPassword && !passwordsMatch
                  ? 'border-red-500/50'
                  : confirmPassword && passwordsMatch
                  ? 'border-emerald-500/50'
                  : 'border-white/10'
              )}>
                <Lock size={20} color="#9CA3AF" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 text-white py-4 ml-3"
                />
                {confirmPassword && passwordsMatch && (
                  <Check size={20} color="#10B981" />
                )}
              </View>
              {confirmPassword && !passwordsMatch && (
                <Text className="text-red-400 text-xs mt-1">
                  {language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match'}
                </Text>
              )}
            </Animated.View>

            {/* Terms Checkbox */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(350)}
              className="mb-6"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAcceptTerms(!acceptTerms);
                }}
                className="flex-row items-start"
              >
                <View className={cn(
                  'w-6 h-6 rounded-md border-2 items-center justify-center mr-3 mt-0.5',
                  acceptTerms
                    ? 'bg-amber-500 border-amber-500'
                    : 'border-white/30'
                )}>
                  {acceptTerms && <Check size={16} color="#000" />}
                </View>
                <Text className="flex-1 text-gray-400 text-sm">
                  {language === 'fr'
                    ? "J'accepte les conditions d'utilisation et la politique de confidentialité"
                    : 'I agree to the Terms of Service and Privacy Policy'}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Error Message */}
            {error && (
              <View className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <Text className="text-red-400 text-center">{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <Animated.View entering={FadeInDown.duration(500).delay(400)}>
              <Pressable
                onPress={handleRegister}
                disabled={isLoading || !isFormValid}
                className={cn(
                  'rounded-xl overflow-hidden',
                  (isLoading || !isFormValid) && 'opacity-50'
                )}
              >
                <LinearGradient
                  colors={['#FFB800', '#FF8C00']}
                  style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <Text className="text-black text-lg font-bold">
                    {isLoading
                      ? (language === 'fr' ? 'Création...' : 'Creating...')
                      : (language === 'fr' ? 'Créer mon compte' : 'Create Account')}
                  </Text>
                  {!isLoading && <ChevronRight size={20} color="#000" />}
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-400">
                {language === 'fr' ? 'Déjà un compte? ' : 'Already have an account? '}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="text-amber-400 font-semibold">
                  {language === 'fr' ? 'Se connecter' : 'Sign in'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
