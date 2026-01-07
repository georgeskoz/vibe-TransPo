import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const loginWithPhone = useAuthStore((s) => s.loginWithPhone);
  const sendOTP = useAuthStore((s) => s.sendOTP);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-submit when all digits entered
  useEffect(() => {
    const code = otp.join('');
    if (code.length === OTP_LENGTH) {
      handleVerify(code);
    }
  }, [otp]);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== OTP_LENGTH || !phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await loginWithPhone(phone, code);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !phone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await sendOTP(phone);
    if (success) {
      setResendTimer(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const maskedPhone = phone
    ? `+1 (***) ***-${phone.slice(-4)}`
    : '';

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
          </View>

          {/* Content */}
          <View className="flex-1 px-6 pt-8">
            <Animated.View entering={FadeInDown.duration(500).delay(100)}>
              <Text className="text-white text-3xl font-bold">
                {language === 'fr' ? 'Vérification' : 'Verification'}
              </Text>
              <Text className="text-gray-400 mt-3 text-lg">
                {language === 'fr'
                  ? `Entrez le code envoyé au ${maskedPhone}`
                  : `Enter the code sent to ${maskedPhone}`}
              </Text>
            </Animated.View>

            {/* OTP Input */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200)}
              className="flex-row justify-between mt-10"
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  className={cn(
                    'w-12 h-14 text-center text-white text-2xl font-bold rounded-xl border-2',
                    digit
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-white/5 border-white/20'
                  )}
                />
              ))}
            </Animated.View>

            {/* Error Message */}
            {error && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-3"
              >
                <Text className="text-red-400 text-center">{error}</Text>
              </Animated.View>
            )}

            {/* Resend Code */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(300)}
              className="mt-8 items-center"
            >
              {resendTimer > 0 ? (
                <Text className="text-gray-400">
                  {language === 'fr'
                    ? `Renvoyer le code dans ${resendTimer}s`
                    : `Resend code in ${resendTimer}s`}
                </Text>
              ) : (
                <Pressable
                  onPress={handleResend}
                  className="flex-row items-center"
                  disabled={isLoading}
                >
                  <RefreshCw size={18} color="#FFB800" />
                  <Text className="text-amber-400 font-semibold ml-2">
                    {language === 'fr' ? 'Renvoyer le code' : 'Resend code'}
                  </Text>
                </Pressable>
              )}
            </Animated.View>

            {/* Verify Button */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(400)}
              className="mt-auto mb-8"
            >
              <Pressable
                onPress={() => handleVerify(otp.join(''))}
                disabled={isLoading || otp.join('').length !== OTP_LENGTH}
                className={cn(
                  'rounded-xl overflow-hidden',
                  (isLoading || otp.join('').length !== OTP_LENGTH) && 'opacity-50'
                )}
              >
                <LinearGradient
                  colors={['#FFB800', '#FF8C00']}
                  style={{ padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                >
                  <Text className="text-black text-lg font-bold">
                    {isLoading
                      ? (language === 'fr' ? 'Vérification...' : 'Verifying...')
                      : (language === 'fr' ? 'Vérifier' : 'Verify')}
                  </Text>
                  {!isLoading && <ChevronRight size={20} color="#000" />}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
