import React, { useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Helper functions for easy toast creation
export const toast = {
  success: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'success', title, message }),
  error: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'error', title, message }),
  warning: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'warning', title, message }),
  info: (title: string, message?: string) =>
    useToastStore.getState().addToast({ type: 'info', title, message }),
};

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-900/90',
    borderColor: 'border-green-500',
    iconColor: '#22C55E',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-900/90',
    borderColor: 'border-red-500',
    iconColor: '#EF4444',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-900/90',
    borderColor: 'border-yellow-500',
    iconColor: '#FBBF24',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-900/90',
    borderColor: 'border-blue-500',
    iconColor: '#3B82F6',
  },
};

function ToastItem({ toast: toastData, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const config = toastConfig[toastData.type];
  const Icon = config.icon;

  const dismiss = useCallback(() => {
    translateY.value = withTiming(-100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
  }, [onDismiss, translateY, opacity]);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
    opacity.value = withTiming(1, { duration: 300 });

    const duration = toastData.duration ?? 4000;
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toastData.duration, dismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`mx-4 mb-2 rounded-xl ${config.bgColor} border ${config.borderColor} p-4 flex-row items-start`}
    >
      <Icon size={24} color={config.iconColor} />
      <View className="flex-1 ml-3">
        <Text className="text-white font-semibold text-base">{toastData.title}</Text>
        {toastData.message && (
          <Text className="text-gray-300 text-sm mt-1">{toastData.message}</Text>
        )}
      </View>
      <Pressable onPress={dismiss} hitSlop={10}>
        <X size={20} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );
}

export function ToastContainer() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <View
      className="absolute left-0 right-0 z-50"
      style={{ top: insets.top + 10 }}
      pointerEvents="box-none"
    >
      {toasts.map((toastData) => (
        <ToastItem
          key={toastData.id}
          toast={toastData}
          onDismiss={() => removeToast(toastData.id)}
        />
      ))}
    </View>
  );
}
