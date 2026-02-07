import React from 'react';
import { View, Text, ScrollView, Pressable, Share, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Car,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Download,
  Share2,
  CheckCircle,
  User,
  FileText,
} from 'lucide-react-native';
import {
  FareBreakdown,
  TaxiReceipt,
  formatCurrency,
  formatDistance,
  formatDuration,
  QUEBEC_TAXES,
} from '@/lib/quebec-taxi';

interface ReceiptProps {
  receipt: TaxiReceipt;
  onClose: () => void;
  language?: 'fr' | 'en';
}

export function Receipt({ receipt, onClose, language = 'en' }: ReceiptProps) {
  const insets = useSafeAreaInsets();
  const { fare, trip } = receipt;

  const formatDate = (date: Date) => {
    if (language === 'fr') {
      return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    const receiptText = `
TransPo Receipt
${receipt.receiptNumber}
${formatDate(receipt.date)} ${formatTime(receipt.date)}

From: ${receipt.pickupAddress}
To: ${receipt.dropoffAddress}

Distance: ${formatDistance(trip.distanceKm, language)}
Duration: ${formatDuration(trip.durationMinutes, language)}

Fare Subtotal: ${formatCurrency(fare.subtotal - fare.regulatoryFee, language)}
Regulatory Fee: ${formatCurrency(fare.regulatoryFee, language)}
GST (5%): ${formatCurrency(fare.gst, language)}
QST (9.975%): ${formatCurrency(fare.qst, language)}
Total: ${formatCurrency(fare.total, language)}

Driver: ${receipt.driverName}
Permit: ${receipt.driverPermitNumber}
    `.trim();

    try {
      await Share.share({
        message: receiptText,
        title: `TransPo Receipt ${receipt.receiptNumber}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const labels = {
    en: {
      receipt: 'Receipt',
      tripCompleted: 'Trip Completed',
      from: 'From',
      to: 'To',
      tripDetails: 'Trip Details',
      distance: 'Distance',
      duration: 'Duration',
      waitingTime: 'Waiting Time',
      fareBreakdown: 'Fare Breakdown',
      baseFare: 'Base Fare',
      distanceCharge: 'Distance Charge',
      waitingCharge: 'Waiting Time',
      airportSurcharge: 'Airport Surcharge',
      regulatoryFee: 'Regulatory Fee',
      subtotal: 'Subtotal',
      gst: 'GST (TPS)',
      qst: 'QST (TVQ)',
      total: 'Total',
      paymentMethod: 'Payment Method',
      cash: 'Cash',
      card: 'Credit/Debit Card',
      driverInfo: 'Driver Information',
      driver: 'Driver',
      permit: 'Permit No.',
      vehicle: 'Vehicle',
      shareReceipt: 'Share Receipt',
      download: 'Download',
      close: 'Close',
    },
    fr: {
      receipt: 'Reçu',
      tripCompleted: 'Course Terminée',
      from: 'De',
      to: 'À',
      tripDetails: 'Détails de la course',
      distance: 'Distance',
      duration: 'Durée',
      waitingTime: 'Temps d\'attente',
      fareBreakdown: 'Détail du tarif',
      baseFare: 'Prise en charge',
      distanceCharge: 'Distance',
      waitingCharge: 'Attente',
      airportSurcharge: 'Supplément aéroport',
      regulatoryFee: 'Frais réglementaires',
      subtotal: 'Sous-total',
      gst: 'TPS',
      qst: 'TVQ',
      total: 'Total',
      paymentMethod: 'Mode de paiement',
      cash: 'Comptant',
      card: 'Carte crédit/débit',
      driverInfo: 'Informations du chauffeur',
      driver: 'Chauffeur',
      permit: 'No. de permis',
      vehicle: 'Véhicule',
      shareReceipt: 'Partager le reçu',
      download: 'Télécharger',
      close: 'Fermer',
    },
  };

  const t = labels[language];

  return (
    <View className="flex-1 bg-gray-900">
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-white text-lg font-bold">{t.receipt}</Text>
        <Pressable onPress={onClose} className="p-2 -mr-2">
          <X size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View className="items-center py-6 bg-green-900/20">
          <View className="bg-green-500/20 rounded-full p-4 mb-3">
            <CheckCircle size={48} color="#22C55E" />
          </View>
          <Text className="text-green-400 text-xl font-bold">{t.tripCompleted}</Text>
          <Text className="text-gray-400 text-sm mt-1">{receipt.receiptNumber}</Text>
          <Text className="text-gray-500 text-xs mt-1">
            {formatDate(receipt.date)} • {formatTime(receipt.date)}
          </Text>
        </View>

        {/* Route */}
        <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
          <View className="flex-row items-start mb-4">
            <View className="items-center mr-3">
              <View className="w-3 h-3 rounded-full bg-green-500" />
              <View className="w-0.5 h-8 bg-gray-600 my-1" />
              <View className="w-3 h-3 rounded-full bg-amber-500" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">{t.from}</Text>
              <Text className="text-white font-medium mb-4">{receipt.pickupAddress}</Text>
              <Text className="text-gray-400 text-xs mb-1">{t.to}</Text>
              <Text className="text-white font-medium">{receipt.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">{t.tripDetails}</Text>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="bg-gray-700 rounded-full p-2 mb-2">
                <MapPin size={18} color="#FBBF24" />
              </View>
              <Text className="text-gray-400 text-xs">{t.distance}</Text>
              <Text className="text-white font-semibold">
                {formatDistance(trip.distanceKm, language)}
              </Text>
            </View>
            <View className="items-center flex-1">
              <View className="bg-gray-700 rounded-full p-2 mb-2">
                <Clock size={18} color="#FBBF24" />
              </View>
              <Text className="text-gray-400 text-xs">{t.duration}</Text>
              <Text className="text-white font-semibold">
                {formatDuration(trip.durationMinutes, language)}
              </Text>
            </View>
            {trip.waitingMinutes > 0 && (
              <View className="items-center flex-1">
                <View className="bg-gray-700 rounded-full p-2 mb-2">
                  <Clock size={18} color="#FBBF24" />
                </View>
                <Text className="text-gray-400 text-xs">{t.waitingTime}</Text>
                <Text className="text-white font-semibold">
                  {formatDuration(trip.waitingMinutes, language)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Fare Breakdown */}
        <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">{t.fareBreakdown}</Text>

          <View style={{ gap: 8 }}>
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-400">{t.baseFare}</Text>
              <Text className="text-white">{formatCurrency(fare.baseFare, language)}</Text>
            </View>

            {fare.distanceFare > 0 && (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-400">
                  {t.distanceCharge} ({formatDistance(trip.distanceKm, language)})
                </Text>
                <Text className="text-white">{formatCurrency(fare.distanceFare, language)}</Text>
              </View>
            )}

            {fare.waitingFare > 0 && (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-400">{t.waitingCharge}</Text>
                <Text className="text-white">{formatCurrency(fare.waitingFare, language)}</Text>
              </View>
            )}

            {fare.airportSurcharge > 0 && (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-400">{t.airportSurcharge}</Text>
                <Text className="text-white">{formatCurrency(fare.airportSurcharge, language)}</Text>
              </View>
            )}

            {/* Regulatory Fee - Mandatory $0.90 since Jan 1, 2021 */}
            {fare.regulatoryFee > 0 && (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-400">{t.regulatoryFee}</Text>
                <Text className="text-white">{formatCurrency(fare.regulatoryFee, language)}</Text>
              </View>
            )}

            <View className="border-t border-gray-700 my-2" />

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-400">{t.subtotal}</Text>
              <Text className="text-white">{formatCurrency(fare.subtotal, language)}</Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-400">{t.gst} (5%)</Text>
              <Text className="text-white">{formatCurrency(fare.gst, language)}</Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-400">{t.qst} (9.975%)</Text>
              <Text className="text-white">{formatCurrency(fare.qst, language)}</Text>
            </View>

            <View className="border-t border-gray-700 my-2" />

            <View className="flex-row justify-between py-1">
              <Text className="text-white font-bold text-lg">{t.total}</Text>
              <Text className="text-amber-500 font-bold text-lg">
                {formatCurrency(fare.total, language)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">{t.paymentMethod}</Text>
          <View className="flex-row items-center">
            {receipt.paymentMethod === 'card' ? (
              <CreditCard size={24} color="#FBBF24" />
            ) : (
              <Banknote size={24} color="#22C55E" />
            )}
            <Text className="text-white ml-3">
              {receipt.paymentMethod === 'card' ? t.card : t.cash}
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        <View className="mx-4 mt-4 bg-gray-800 rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">{t.driverInfo}</Text>

          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-full p-2">
              <User size={20} color="#9CA3AF" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-400 text-xs">{t.driver}</Text>
              <Text className="text-white">{receipt.driverName}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-3">
            <View className="bg-gray-700 rounded-full p-2">
              <FileText size={20} color="#9CA3AF" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-400 text-xs">{t.permit}</Text>
              <Text className="text-white">{receipt.driverPermitNumber}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="bg-gray-700 rounded-full p-2">
              <Car size={20} color="#9CA3AF" />
            </View>
            <View className="ml-3">
              <Text className="text-gray-400 text-xs">{t.vehicle}</Text>
              <Text className="text-white">{receipt.vehiclePlate}</Text>
            </View>
          </View>
        </View>

        {/* Tax Numbers */}
        {(receipt.gstNumber || receipt.qstNumber) && (
          <View className="mx-4 mt-4 mb-6">
            {receipt.gstNumber && (
              <Text className="text-gray-500 text-xs text-center">
                GST/TPS: {receipt.gstNumber}
              </Text>
            )}
            {receipt.qstNumber && (
              <Text className="text-gray-500 text-xs text-center mt-1">
                QST/TVQ: {receipt.qstNumber}
              </Text>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="mx-4 mt-2 mb-6 flex-row" style={{ gap: 12 }}>
          <Pressable
            onPress={handleShare}
            className="flex-1 bg-gray-800 py-4 rounded-xl flex-row items-center justify-center active:bg-gray-700"
          >
            <Share2 size={20} color="#fff" />
            <Text className="text-white font-semibold ml-2">{t.shareReceipt}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Close Button */}
      <View
        className="px-4 pb-4 border-t border-gray-800"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={onClose}
          className="bg-amber-500 py-4 rounded-xl items-center active:bg-amber-600"
        >
          <Text className="text-black font-bold text-lg">{t.close}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Quick Receipt Preview for Activity list
interface ReceiptPreviewProps {
  fare: FareBreakdown;
  date: Date;
  pickup: string;
  destination: string;
  onPress?: () => void;
  language?: 'fr' | 'en';
}

export function ReceiptPreview({
  fare,
  date,
  pickup,
  destination,
  onPress,
  language = 'en',
}: ReceiptPreviewProps) {
  const formatDateShort = (d: Date) => {
    return d.toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-gray-800 rounded-2xl p-4 mb-3 active:bg-gray-700"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="bg-amber-500/20 rounded-full p-2">
            <Car size={20} color="#FBBF24" />
          </View>
          <Text className="text-white font-semibold ml-3">TransPo</Text>
        </View>
        <Text className="text-gray-400 text-sm">{formatDateShort(date)}</Text>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <Text className="text-gray-400 text-sm flex-1" numberOfLines={1}>
            {pickup}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
          <Text className="text-gray-400 text-sm flex-1" numberOfLines={1}>
            {destination}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-700">
        <Text className="text-gray-400">
          {language === 'fr' ? 'Taxes incluses' : 'Tax included'}
        </Text>
        <Text className="text-white font-bold text-lg">
          {formatCurrency(fare.total, language)}
        </Text>
      </View>
    </Pressable>
  );
}
