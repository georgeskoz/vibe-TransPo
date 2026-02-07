import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, Phone, ChevronRight, Car } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

type LoginMethod = 'email' | 'phone';

export default function LoginScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const sendOTP = useAuthStore((s) => s.sendOTP);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [method, setMethod] = useState<LoginMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await login(email, password);
    if (success) {
      router.replace('/');
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone || phone.length < 10) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await sendOTP(phone);
    if (success) {
      router.push({ pathname: '/auth/verify-otp', params: { phone } });
    }
  };

  const handleGoogleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement Google OAuth
    router.replace('/');
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
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(100)}
              className="items-center pt-12 pb-8"
            >
              <View className="w-20 h-20 bg-amber-500 rounded-2xl items-center justify-center mb-4">
                <Car size={40} color="#000" />
              </View>
              <Text className="text-white text-3xl font-bold">QuébecTaxi</Text>
              <Text className="text-gray-400 mt-2">
                {language === 'fr' ? 'Bienvenue' : 'Welcome back'}
              </Text>
            </Animated.View>

            {/* Login Method Toggle */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(200)}
              className="px-6 mb-6"
            >
              <View className="flex-row bg-white/5 rounded-xl p-1">
                <Pressable
                  onPress={() => setMethod('email')}
                  className={cn(
                    'flex-1 py-3 rounded-lg items-center',
                    method === 'email' && 'bg-amber-500'
                  )}
                >
                  <Text className={cn(
                    'font-semibold',
                    method === 'email' ? 'text-black' : 'text-gray-400'
                  )}>
                    {language === 'fr' ? 'Courriel' : 'Email'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMethod('phone')}
                  className={cn(
                    'flex-1 py-3 rounded-lg items-center',
                    method === 'phone' && 'bg-amber-500'
                  )}
                >
                  <Text className={cn(
                    'font-semibold',
                    method === 'phone' ? 'text-black' : 'text-gray-400'
                  )}>
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(300)}
              className="px-6"
            >
              {method === 'email' ? (
                <>
                  {/* Email Input */}
                  <View className="mb-4">
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
                  </View>

                  {/* Password Input */}
                  <View className="mb-6">
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
                  </View>

                  {/* Forgot Password */}
                  <Pressable className="mb-6">
                    <Text className="text-amber-400 text-right">
                      {language === 'fr' ? 'Mot de passe oublié?' : 'Forgot password?'}
                    </Text>
                  </Pressable>

                  {/* Login Button */}
                  <Pressable
                    onPress={handleEmailLogin}
                    disabled={isLoading || !email || !password}
                    className={cn(
                      'rounded-xl overflow-hidden',
                      (isLoading || !email || !password) && 'opacity-50'
                    )}
                  >
                    <LinearGradient
                      colors={['#FFB800', '#FF8C00']}
                      style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                      <Text className="text-black text-lg font-bold">
                        {isLoading
                          ? (language === 'fr' ? 'Connexion...' : 'Signing in...')
                          : (language === 'fr' ? 'Se connecter' : 'Sign In')}
                      </Text>
                      {!isLoading && <ChevronRight size={20} color="#000" />}
                    </LinearGradient>
                  </Pressable>
                </>
              ) : (
                <>
                  {/* Phone Input */}
                  <View className="mb-6">
                    <Text className="text-gray-400 text-sm mb-2">
                      {language === 'fr' ? 'Numéro de téléphone' : 'Phone number'}
                    </Text>
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-xl px-4">
                      <View className="flex-row items-center pr-3 border-r border-white/10">
                        <Text className="text-white">🇨🇦 +1</Text>
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
                  </View>

                  {/* Send OTP Button */}
                  <Pressable
                    onPress={handlePhoneLogin}
                    disabled={isLoading || phone.length < 10}
                    className={cn(
                      'rounded-xl overflow-hidden',
                      (isLoading || phone.length < 10) && 'opacity-50'
                    )}
                  >
                    <LinearGradient
                      colors={['#FFB800', '#FF8C00']}
                      style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                    >
                      <Text className="text-black text-lg font-bold">
                        {isLoading
                          ? (language === 'fr' ? 'Envoi...' : 'Sending...')
                          : (language === 'fr' ? 'Recevoir le code' : 'Get verification code')}
                      </Text>
                      {!isLoading && <ChevronRight size={20} color="#000" />}
                    </LinearGradient>
                  </Pressable>
                </>
              )}

              {/* Error Message */}
              {error && (
                <View className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <Text className="text-red-400 text-center">{error}</Text>
                </View>
              )}
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(400)}
              className="px-6 my-8"
            >
              <View className="flex-row items-center">
                <View className="flex-1 h-px bg-white/10" />
                <Text className="text-gray-500 mx-4">
                  {language === 'fr' ? 'ou continuer avec' : 'or continue with'}
                </Text>
                <View className="flex-1 h-px bg-white/10" />
              </View>
            </Animated.View>

            {/* Social Login */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(500)}
              className="px-6"
            >
              <Pressable
                onPress={handleGoogleLogin}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-center"
              >
                <Text className="text-2xl mr-3">🔵</Text>
                <Text className="text-white font-semibold">
                  {language === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(600)}
              className="flex-row justify-center mt-8 mb-6"
            >
              <Text className="text-gray-400">
                {language === 'fr' ? "Pas de compte? " : "Don't have an account? "}
              </Text>
              <Pressable onPress={() => router.push('/auth/register')}>
                <Text className="text-amber-400 font-semibold">
                  {language === 'fr' ? "S'inscrire" : 'Sign up'}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Skip for now (Demo) */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(700)}
              className="items-center mb-8"
            >
              <Pressable
                onPress={() => router.replace('/')}
                className="py-2 px-4"
              >
                <Text className="text-gray-500">
                  {language === 'fr' ? 'Passer pour le moment' : 'Skip for now'}
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
