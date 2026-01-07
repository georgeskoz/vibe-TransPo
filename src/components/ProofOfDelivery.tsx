import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Camera, X, Check, RotateCcw, MapPin, Clock, Package } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp, SlideInUp } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

interface ProofOfDeliveryProps {
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  onComplete: (proof: DeliveryProof) => void;
  onCancel: () => void;
}

export interface DeliveryProof {
  photoUri: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
  trackingNumber: string;
  recipientName: string;
  notes?: string;
}

export function ProofOfDeliveryCamera({
  trackingNumber,
  recipientName,
  recipientAddress,
  onComplete,
  onCancel,
}: ProofOfDeliveryProps) {
  const { language } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Get location on mount
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (result?.uri) {
        setPhoto(result.uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      Alert.alert(
        language === 'fr' ? 'Erreur' : 'Error',
        language === 'fr' ? 'Impossible de prendre la photo' : 'Failed to capture photo'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhoto(null);
  };

  const handleConfirm = () => {
    if (!photo) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const proof: DeliveryProof = {
      photoUri: photo,
      timestamp: new Date(),
      location,
      trackingNumber,
      recipientName,
    };

    onComplete(proof);
  };

  // Permission handling
  if (!permission) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <Text className="text-white">
          {language === 'fr' ? 'Chargement...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-zinc-950">
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Camera size={64} color="#9CA3AF" />
          <Text className="text-white text-xl font-bold mt-6 text-center">
            {language === 'fr' ? 'Accès à la caméra requis' : 'Camera Access Required'}
          </Text>
          <Text className="text-gray-400 text-center mt-3">
            {language === 'fr'
              ? 'Nous avons besoin d\'accéder à votre caméra pour prendre une photo de la livraison.'
              : 'We need camera access to take a proof of delivery photo.'}
          </Text>
          <Pressable
            onPress={requestPermission}
            className="mt-8 bg-cyan-500 px-8 py-4 rounded-xl"
          >
            <Text className="text-white font-bold">
              {language === 'fr' ? 'Autoriser la caméra' : 'Allow Camera'}
            </Text>
          </Pressable>
          <Pressable onPress={onCancel} className="mt-4 py-2">
            <Text className="text-gray-400">
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  // Photo preview
  if (photo) {
    return (
      <View className="flex-1 bg-zinc-950">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Text className="text-white text-xl font-bold">
              {language === 'fr' ? 'Confirmer la photo' : 'Confirm Photo'}
            </Text>
            <Pressable onPress={onCancel}>
              <X size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Photo Preview */}
          <View className="flex-1 mx-5 rounded-2xl overflow-hidden">
            <Image
              source={{ uri: photo }}
              className="flex-1"
              resizeMode="cover"
            />

            {/* Overlay Info */}
            <Animated.View
              entering={SlideInUp.duration(300)}
              className="absolute bottom-0 left-0 right-0"
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{ padding: 16 }}
              >
                <View className="flex-row items-center mb-2">
                  <Package size={16} color="#06B6D4" />
                  <Text className="text-white ml-2 font-mono">{trackingNumber}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#10B981" />
                  <Text className="text-white ml-2" numberOfLines={1}>{recipientAddress}</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={16} color="#F59E0B" />
                  <Text className="text-white ml-2">
                    {new Date().toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 px-5 py-6">
            <Pressable
              onPress={handleRetake}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 flex-row items-center justify-center"
            >
              <RotateCcw size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                {language === 'fr' ? 'Reprendre' : 'Retake'}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              className="flex-1 rounded-xl overflow-hidden"
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">
                  {language === 'fr' ? 'Confirmer' : 'Confirm'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Camera View
  return (
    <View className="flex-1 bg-zinc-950">
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
      >
        {/* Overlay */}
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="px-5 py-4 flex-row items-center justify-between">
            <Pressable
              onPress={onCancel}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <X size={24} color="#fff" />
            </Pressable>
            <Text className="text-white text-lg font-bold">
              {language === 'fr' ? 'Preuve de livraison' : 'Proof of Delivery'}
            </Text>
            <View className="w-10" />
          </View>

          {/* Delivery Info */}
          <Animated.View
            entering={FadeIn.duration(500)}
            className="mx-5 mt-4 bg-black/60 rounded-xl p-4"
          >
            <View className="flex-row items-center mb-2">
              <Package size={18} color="#06B6D4" />
              <Text className="text-white ml-2 font-mono text-sm">{trackingNumber}</Text>
            </View>
            <Text className="text-white font-semibold">{recipientName}</Text>
            <Text className="text-gray-300 text-sm mt-1" numberOfLines={2}>
              {recipientAddress}
            </Text>
          </Animated.View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Instructions */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            className="mx-5 mb-4 bg-black/60 rounded-xl p-4"
          >
            <Text className="text-white text-center">
              {language === 'fr'
                ? 'Prenez une photo claire du colis livré'
                : 'Take a clear photo of the delivered package'}
            </Text>
          </Animated.View>

          {/* Capture Button */}
          <View className="items-center mb-8">
            <Pressable
              onPress={handleCapture}
              disabled={isCapturing}
              className="w-20 h-20 rounded-full bg-white items-center justify-center"
              style={{ opacity: isCapturing ? 0.5 : 1 }}
            >
              <View className="w-16 h-16 rounded-full border-4 border-black items-center justify-center">
                <Camera size={28} color="#000" />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

// Proof of delivery summary card
export function DeliveryProofCard({ proof }: { proof: DeliveryProof }) {
  const { language } = useTranslation();

  return (
    <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden m-4">
      {/* Photo */}
      <Image
        source={{ uri: proof.photoUri }}
        className="w-full h-48"
        resizeMode="cover"
      />

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-emerald-400 font-semibold">
            {language === 'fr' ? '✓ Livraison confirmée' : '✓ Delivery Confirmed'}
          </Text>
          <Text className="text-gray-400 text-sm">
            {proof.timestamp.toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View className="flex-row items-center mb-2">
          <Package size={14} color="#9CA3AF" />
          <Text className="text-white ml-2 font-mono text-sm">{proof.trackingNumber}</Text>
        </View>

        <View className="flex-row items-center">
          <MapPin size={14} color="#9CA3AF" />
          <Text className="text-gray-400 ml-2 text-sm">
            {proof.location
              ? `${proof.location.latitude.toFixed(4)}, ${proof.location.longitude.toFixed(4)}`
              : (language === 'fr' ? 'Position non disponible' : 'Location unavailable')}
          </Text>
        </View>
      </View>
    </View>
  );
}
