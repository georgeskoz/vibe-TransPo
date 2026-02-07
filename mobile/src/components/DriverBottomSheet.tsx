import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, Dimensions, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Settings, List, LogOut, FileText, TrendingUp, User, HelpCircle } from 'lucide-react-native';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  FadeIn,
  clamp,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap points: collapsed, half, full
const COLLAPSED_HEIGHT = 80;
const HALF_HEIGHT = 260;
const FULL_HEIGHT = SCREEN_HEIGHT * 0.9;

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 250,
  mass: 0.8,
};

interface DriverBottomSheetProps {
  onLogout?: () => void;
}

export function DriverBottomSheet({ onLogout }: DriverBottomSheetProps) {
  const { language } = useTranslation();
  const setUserMode = useAppStore((s) => s.setUserMode);
  const todayEarnings = useAppStore((s) => s.todayEarnings);

  const sheetHeight = useSharedValue(COLLAPSED_HEIGHT);
  const startY = useSharedValue(0);

  const handleLogout = useCallback(() => {
    setUserMode('rider');
    onLogout?.();
  }, [setUserMode, onLogout]);

  const snapToNearest = useCallback((currentHeight: number) => {
    'worklet';
    const snapPoints = [COLLAPSED_HEIGHT, HALF_HEIGHT, FULL_HEIGHT];
    let closest = snapPoints[0];
    let minDist = Math.abs(currentHeight - snapPoints[0]);
    for (let i = 1; i < snapPoints.length; i++) {
      const dist = Math.abs(currentHeight - snapPoints[i]);
      if (dist < minDist) {
        minDist = dist;
        closest = snapPoints[i];
      }
    }
    return closest;
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = sheetHeight.value;
    })
    .onUpdate((event) => {
      const newHeight = startY.value - event.translationY;
      sheetHeight.value = clamp(newHeight, COLLAPSED_HEIGHT, FULL_HEIGHT);
    })
    .onEnd((event) => {
      const velocity = -event.velocityY;
      const projected = sheetHeight.value + velocity * 0.15;
      const snap = snapToNearest(projected);
      sheetHeight.value = withSpring(snap, SPRING_CONFIG);
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const expandedContentOpacity = useAnimatedStyle(() => {
    const opacity = sheetHeight.value > COLLAPSED_HEIGHT + 20
      ? Math.min((sheetHeight.value - COLLAPSED_HEIGHT - 20) / (HALF_HEIGHT - COLLAPSED_HEIGHT - 20), 1)
      : 0;
    return { opacity };
  });

  const menuContentOpacity = useAnimatedStyle(() => {
    const opacity = sheetHeight.value > HALF_HEIGHT + 20
      ? Math.min((sheetHeight.value - HALF_HEIGHT - 20) / (FULL_HEIGHT - HALF_HEIGHT - 80), 1)
      : 0;
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.sheetContainer,
          animatedSheetStyle,
        ]}
      >
        <BlurView intensity={85} style={styles.blurView}>
          {/* Handle Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View className="flex-1 px-5">
            {/* Always Visible - Online Status Header */}
            <View className="pb-3">
              <View className="flex-row items-center justify-between">
                <Pressable
                  className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                  onPress={() => {}}
                >
                  <Settings size={20} color="#fff" strokeWidth={2} />
                </Pressable>

                <View className="flex-1 items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-emerald-400" />
                    <Text className="text-white text-lg font-bold">
                      {language === 'fr' ? 'En ligne' : 'You\'re online'}
                    </Text>
                  </View>
                </View>

                <Pressable
                  className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                  onPress={() => {}}
                >
                  <List size={20} color="#fff" strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            {/* Half-Expanded - Earnings Summary */}
            <Animated.View style={expandedContentOpacity}>
              <View className="border-t border-white/20 pt-4 mt-2">
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
              </View>
            </Animated.View>

            {/* Full-Expanded - Menu Grid */}
            <Animated.View style={menuContentOpacity} className="mt-6">
              <Text className="text-white text-xs font-semibold uppercase tracking-wide mb-3">
                {language === 'fr' ? 'Menu' : 'Menu'}
              </Text>
              <View className="flex-row flex-wrap gap-3">
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

              {/* Logout Button */}
              <Pressable
                onPress={handleLogout}
                className="bg-red-500/80 rounded-2xl py-4 items-center mt-6"
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
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
