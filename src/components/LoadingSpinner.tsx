import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#FBBF24',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const content = (
    <View className="items-center justify-center">
      <Animated.View
        style={[
          animatedStyle,
          {
            width: size === 'large' ? 48 : 24,
            height: size === 'large' ? 48 : 24,
            borderWidth: size === 'large' ? 4 : 2,
            borderColor: `${color}30`,
            borderTopColor: color,
            borderRadius: 100,
          },
        ]}
      />
      {message && (
        <Text className="text-gray-400 mt-4 text-center">{message}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 bg-gray-900 items-center justify-center">
        {content}
      </View>
    );
  }

  return content;
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 bg-black/70 items-center justify-center z-50"
      style={{ elevation: 10 }}
    >
      <View className="bg-gray-800 rounded-2xl p-8 items-center mx-8">
        <ActivityIndicator size="large" color="#FBBF24" />
        {message && (
          <Text className="text-white mt-4 text-center font-medium">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
}

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  className?: string;
  flex?: number;
}

export function Skeleton({
  width,
  height = 20,
  borderRadius = 8,
  className = '',
  flex,
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: width ?? (flex ? undefined : 200),
          height,
          borderRadius,
          backgroundColor: '#374151',
          flex,
        },
      ]}
      className={className}
    />
  );
}

export function CardSkeleton() {
  return (
    <View className="bg-gray-800 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center mb-3">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="ml-3 flex-1">
          <Skeleton width={150} height={16} className="mb-2" />
          <Skeleton width={100} height={12} />
        </View>
      </View>
      <Skeleton flex={1} height={12} className="mb-2" />
      <Skeleton width={200} height={12} />
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}
