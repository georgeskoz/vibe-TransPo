import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  ChevronRight,
  Receipt,
  Wallet,
} from 'lucide-react-native';
import { FareBreakdown, formatCurrency } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

export type PaymentMethod = 'card_on_file' | 'cash' | 'credit_card' | 'apple_pay' | 'google_pay';

interface PaymentScreenProps {
  visible: boolean;
  fare: FareBreakdown;
  language: 'fr' | 'en';
  onPaymentComplete: (method: PaymentMethod, tipAmount: number) => void;
  onCancel: () => void;
  savedCard?: {
    last4: string;
    brand: string;
  };
}

const tipOptions = [0, 10, 15, 20, 25];

export function PaymentScreen({
  visible,
  fare,
  language,
  onPaymentComplete,
  onCancel,
  savedCard,
}: PaymentScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    savedCard ? 'card_on_file' : null
  );
  const [selectedTip, setSelectedTip] = useState<number>(15);
  const [customTip, setCustomTip] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const tipAmount = customTip
    ? parseFloat(customTip) || 0
    : (fare.total * selectedTip) / 100;

  const totalWithTip = fare.total + tipAmount;

  const labels = {
    en: {
      paymentMethod: 'Payment Method',
      selectPayment: 'Select payment method',
      cardOnFile: 'Card on File',
      cash: 'Cash',
      creditCard: 'Credit/Debit Card',
      applePay: 'Apple Pay',
      googlePay: 'Google Pay',
      addTip: 'Add a Tip',
      customTip: 'Custom',
      noTip: 'No tip',
      subtotal: 'Subtotal',
      tip: 'Tip',
      total: 'Total',
      pay: 'Pay',
      processing: 'Processing...',
      paymentComplete: 'Payment Complete!',
      thankYou: 'Thank you for riding with TransPo',
      viewReceipt: 'View Receipt',
      done: 'Done',
      cancel: 'Cancel',
    },
    fr: {
      paymentMethod: 'Mode de paiement',
      selectPayment: 'Sélectionnez le mode de paiement',
      cardOnFile: 'Carte enregistrée',
      cash: 'Comptant',
      creditCard: 'Carte crédit/débit',
      applePay: 'Apple Pay',
      googlePay: 'Google Pay',
      addTip: 'Ajouter un pourboire',
      customTip: 'Autre',
      noTip: 'Sans pourboire',
      subtotal: 'Sous-total',
      tip: 'Pourboire',
      total: 'Total',
      pay: 'Payer',
      processing: 'Traitement...',
      paymentComplete: 'Paiement complété!',
      thankYou: 'Merci d\'avoir voyagé avec TransPo',
      viewReceipt: 'Voir le reçu',
      done: 'Terminé',
      cancel: 'Annuler',
    },
  };

  const t = labels[language];

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; available: boolean }[] = [
    {
      id: 'card_on_file',
      label: savedCard ? `${t.cardOnFile} (•••• ${savedCard.last4})` : t.cardOnFile,
      icon: <Wallet size={24} color="#FBBF24" />,
      available: !!savedCard,
    },
    {
      id: 'apple_pay',
      label: t.applePay,
      icon: <Smartphone size={24} color="#fff" />,
      available: true, // In real app, check for Apple Pay availability
    },
    {
      id: 'google_pay',
      label: t.googlePay,
      icon: <Smartphone size={24} color="#4285F4" />,
      available: true, // In real app, check for Google Pay availability
    },
    {
      id: 'credit_card',
      label: t.creditCard,
      icon: <CreditCard size={24} color="#10B981" />,
      available: true,
    },
    {
      id: 'cash',
      label: t.cash,
      icon: <Banknote size={24} color="#22C55E" />,
      available: true,
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsProcessing(true);

    // Simulate payment processing
    // In real app, integrate with Square SDK
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setPaymentSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Auto-complete after showing success
    setTimeout(() => {
      onPaymentComplete(selectedMethod, tipAmount);
    }, 2000);
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMethod(method);
  };

  const handleSelectTip = (tip: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTip(tip);
    setCustomTip('');
  };

  if (paymentSuccess) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <Animated.View
            entering={FadeIn.duration(300)}
            className="bg-gray-900 rounded-3xl p-8 items-center w-full max-w-sm"
          >
            <View className="bg-green-500 rounded-full p-4 mb-4">
              <Check size={48} color="#fff" />
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-2">
              {t.paymentComplete}
            </Text>
            <Text className="text-gray-400 text-center mb-6">{t.thankYou}</Text>

            <View className="bg-gray-800 rounded-xl p-4 w-full mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400">{t.subtotal}</Text>
                <Text className="text-white">{formatCurrency(fare.total, language)}</Text>
              </View>
              {tipAmount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">{t.tip}</Text>
                  <Text className="text-white">{formatCurrency(tipAmount, language)}</Text>
                </View>
              )}
              <View className="border-t border-gray-700 pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-white font-bold">{t.total}</Text>
                  <Text className="text-green-400 font-bold text-xl">
                    {formatCurrency(totalWithTip, language)}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => onPaymentComplete(selectedMethod!, tipAmount)}
              className="bg-amber-500 w-full py-4 rounded-xl items-center"
            >
              <Text className="text-black font-bold text-lg">{t.done}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onCancel} />

        <Animated.View
          entering={SlideInUp.duration(300)}
          className="bg-gray-900 rounded-t-3xl"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            <Text className="text-white text-xl font-bold">{t.paymentMethod}</Text>
            <Pressable onPress={onCancel} className="p-2 -mr-2">
              <X size={24} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Fare Summary */}
          <View className="px-6 py-4 bg-gray-800/50">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-400">{t.subtotal}</Text>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(fare.total, language)}
              </Text>
            </View>
          </View>

          {/* Tip Selection */}
          <View className="px-6 py-4">
            <Text className="text-white font-semibold mb-3">{t.addTip}</Text>
            <View className="flex-row" style={{ gap: 8 }}>
              {tipOptions.map((tip) => (
                <Pressable
                  key={tip}
                  onPress={() => handleSelectTip(tip)}
                  className={cn(
                    'flex-1 py-3 rounded-xl items-center border',
                    selectedTip === tip && !customTip
                      ? 'bg-amber-500/20 border-amber-500'
                      : 'bg-gray-800 border-gray-700'
                  )}
                >
                  <Text
                    className={cn(
                      'font-semibold',
                      selectedTip === tip && !customTip ? 'text-amber-400' : 'text-white'
                    )}
                  >
                    {tip === 0 ? t.noTip : `${tip}%`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Custom Tip */}
            <View className="mt-3">
              <TextInput
                value={customTip}
                onChangeText={(text) => {
                  setCustomTip(text);
                  setSelectedTip(-1);
                }}
                placeholder={t.customTip + ' ($)'}
                placeholderTextColor="#6B7280"
                keyboardType="decimal-pad"
                className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
              />
            </View>

            {/* Tip Amount Display */}
            {tipAmount > 0 && (
              <View className="flex-row justify-between mt-3">
                <Text className="text-gray-400">{t.tip}</Text>
                <Text className="text-amber-400 font-semibold">
                  +{formatCurrency(tipAmount, language)}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Methods */}
          <View className="px-6 py-2">
            <Text className="text-white font-semibold mb-3">{t.selectPayment}</Text>
            {paymentMethods
              .filter((m) => m.available)
              .map((method) => (
                <Pressable
                  key={method.id}
                  onPress={() => handleSelectMethod(method.id)}
                  className={cn(
                    'flex-row items-center p-4 rounded-xl mb-2 border',
                    selectedMethod === method.id
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-gray-800 border-gray-700'
                  )}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                    {method.icon}
                  </View>
                  <Text className="text-white font-medium ml-3 flex-1">{method.label}</Text>
                  {selectedMethod === method.id && (
                    <View className="bg-amber-500 rounded-full p-1">
                      <Check size={16} color="#000" />
                    </View>
                  )}
                </Pressable>
              ))}
          </View>

          {/* Total & Pay Button */}
          <View className="px-6 pt-4">
            <View className="flex-row justify-between mb-4">
              <Text className="text-white text-lg font-semibold">{t.total}</Text>
              <Text className="text-amber-400 text-2xl font-bold">
                {formatCurrency(totalWithTip, language)}
              </Text>
            </View>

            <Pressable
              onPress={handlePayment}
              disabled={!selectedMethod || isProcessing}
              className={cn(
                'py-4 rounded-xl items-center',
                selectedMethod && !isProcessing
                  ? 'bg-amber-500 active:bg-amber-600'
                  : 'bg-gray-700'
              )}
            >
              <Text
                className={cn(
                  'font-bold text-lg',
                  selectedMethod && !isProcessing ? 'text-black' : 'text-gray-500'
                )}
              >
                {isProcessing
                  ? t.processing
                  : `${t.pay} ${formatCurrency(totalWithTip, language)}`}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
