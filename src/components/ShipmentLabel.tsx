import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Printer, Download, Share2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency } from '@/lib/quebec-taxi';
import * as Haptics from 'expo-haptics';

interface ShipmentLabelProps {
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderPhone: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  packageSize: 'small' | 'medium' | 'large';
  isFragile: boolean;
  totalPrice: number;
  estimatedDelivery: string;
  onPrint?: () => void;
  onShare?: () => void;
}

// Simple QR Code visual representation (in production, use react-native-qrcode-svg)
function QRCodePlaceholder({ value, size = 120 }: { value: string; size?: number }) {
  // Generate a deterministic pattern based on the value
  const pattern = Array.from({ length: 64 }, (_, i) => {
    const hash = value.split('').reduce((acc, char, j) => {
      return acc + char.charCodeAt(0) * (i + j + 1);
    }, 0);
    return (hash + i) % 3 !== 0;
  });

  return (
    <View
      style={{ width: size, height: size, backgroundColor: '#fff', padding: 8, borderRadius: 8 }}
    >
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
        {pattern.map((filled, i) => (
          <View
            key={i}
            style={{
              width: '12.5%',
              height: '12.5%',
              backgroundColor: filled ? '#000' : '#fff',
            }}
          />
        ))}
      </View>
      {/* Corner markers */}
      <View style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderWidth: 3, borderColor: '#000' }} />
      <View style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderWidth: 3, borderColor: '#000' }} />
      <View style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, borderWidth: 3, borderColor: '#000' }} />
    </View>
  );
}

export function ShipmentLabel({
  trackingNumber,
  senderName,
  senderAddress,
  senderPhone,
  recipientName,
  recipientAddress,
  recipientPhone,
  packageSize,
  isFragile,
  totalPrice,
  estimatedDelivery,
  onPrint,
  onShare,
}: ShipmentLabelProps) {
  const { language } = useTranslation();

  const packageSizeLabels = {
    small: language === 'fr' ? 'Petit' : 'Small',
    medium: language === 'fr' ? 'Moyen' : 'Medium',
    large: language === 'fr' ? 'Grand' : 'Large',
  };

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      className="bg-white rounded-2xl overflow-hidden mx-4 my-2"
    >
      {/* Header */}
      <LinearGradient
        colors={['#06B6D4', '#0891B2']}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <View>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>QuébecTaxi</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            {language === 'fr' ? 'Service de messagerie' : 'Courier Service'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>
            {language === 'fr' ? 'Numéro de suivi' : 'Tracking #'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' }}>
            {trackingNumber}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* QR Code and Info Row */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {/* QR Code */}
          <View style={{ marginRight: 16 }}>
            <QRCodePlaceholder value={trackingNumber} size={100} />
          </View>

          {/* Package Info */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={{
                backgroundColor: '#06B6D4',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                marginRight: 8
              }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {packageSizeLabels[packageSize]}
                </Text>
              </View>
              {isFragile && (
                <View style={{
                  backgroundColor: '#F59E0B',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4
                }}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    ⚠️ {language === 'fr' ? 'FRAGILE' : 'FRAGILE'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 4 }}>
              {language === 'fr' ? 'Livraison estimée' : 'Est. Delivery'}
            </Text>
            <Text style={{ color: '#111', fontSize: 14, fontWeight: '600' }}>
              {estimatedDelivery}
            </Text>
            <Text style={{ color: '#06B6D4', fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
              {formatCurrency(totalPrice, language)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 }} />

        {/* Sender/Recipient */}
        <View style={{ flexDirection: 'row' }}>
          {/* Sender */}
          <View style={{ flex: 1, paddingRight: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' }}>
            <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
              {language === 'fr' ? 'EXPÉDITEUR' : 'FROM'}
            </Text>
            <Text style={{ color: '#111', fontSize: 13, fontWeight: '600' }}>{senderName}</Text>
            <Text style={{ color: '#4B5563', fontSize: 11, marginTop: 2 }}>{senderAddress}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{senderPhone}</Text>
          </View>

          {/* Recipient */}
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '600', marginBottom: 4 }}>
              {language === 'fr' ? 'DESTINATAIRE' : 'TO'}
            </Text>
            <Text style={{ color: '#111', fontSize: 13, fontWeight: '600' }}>{recipientName}</Text>
            <Text style={{ color: '#4B5563', fontSize: 11, marginTop: 2 }}>{recipientAddress}</Text>
            <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>{recipientPhone}</Text>
          </View>
        </View>

        {/* Barcode representation */}
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', height: 40, marginBottom: 4 }}>
            {trackingNumber.split('').map((char, i) => (
              <View
                key={i}
                style={{
                  width: (char.charCodeAt(0) % 3) + 1,
                  height: '100%',
                  backgroundColor: '#000',
                  marginHorizontal: 1,
                }}
              />
            ))}
          </View>
          <Text style={{ color: '#111', fontSize: 12, fontFamily: 'monospace', letterSpacing: 2 }}>
            {trackingNumber}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrint?.();
          }}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' }}
        >
          <Printer size={18} color="#06B6D4" />
          <Text style={{ color: '#06B6D4', fontWeight: '600', marginLeft: 8 }}>
            {language === 'fr' ? 'Imprimer' : 'Print'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare?.();
          }}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}
        >
          <Share2 size={18} color="#06B6D4" />
          <Text style={{ color: '#06B6D4', fontWeight: '600', marginLeft: 8 }}>
            {language === 'fr' ? 'Partager' : 'Share'}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// Generate tracking number
export function generateTrackingNumber(): string {
  const prefix = 'QT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Compact label for small displays
export function CompactShipmentLabel({
  trackingNumber,
  recipientName,
  recipientAddress,
}: {
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
}) {
  const { language } = useTranslation();

  return (
    <View className="bg-white rounded-xl p-4 m-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-cyan-600 font-bold">QuébecTaxi</Text>
        <QrCode size={20} color="#06B6D4" />
      </View>
      <View className="flex-row">
        <QRCodePlaceholder value={trackingNumber} size={60} />
        <View className="flex-1 ml-3">
          <Text className="text-gray-500 text-xs">
            {language === 'fr' ? 'DESTINATAIRE' : 'TO'}
          </Text>
          <Text className="text-black font-semibold text-sm">{recipientName}</Text>
          <Text className="text-gray-600 text-xs mt-1" numberOfLines={2}>
            {recipientAddress}
          </Text>
        </View>
      </View>
      <Text className="text-center text-black font-mono text-xs mt-3 tracking-wider">
        {trackingNumber}
      </Text>
    </View>
  );
}
