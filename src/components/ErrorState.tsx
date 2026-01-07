import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle, RefreshCw, WifiOff, FileQuestion, Search, Package } from 'lucide-react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'generic' | 'network' | 'notFound' | 'empty';
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'generic',
}: ErrorStateProps) {
  const configs = {
    generic: {
      icon: AlertTriangle,
      iconColor: '#EF4444',
      defaultTitle: 'Something went wrong',
      defaultMessage: 'We encountered an unexpected error. Please try again.',
    },
    network: {
      icon: WifiOff,
      iconColor: '#F59E0B',
      defaultTitle: 'No Connection',
      defaultMessage: 'Please check your internet connection and try again.',
    },
    notFound: {
      icon: FileQuestion,
      iconColor: '#6B7280',
      defaultTitle: 'Not Found',
      defaultMessage: "The content you're looking for doesn't exist.",
    },
    empty: {
      icon: Search,
      iconColor: '#6B7280',
      defaultTitle: 'No Results',
      defaultMessage: "We couldn't find anything matching your search.",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="bg-gray-800/50 rounded-full p-6 mb-6">
        <Icon size={48} color={config.iconColor} />
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        {title ?? config.defaultTitle}
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        {message ?? config.defaultMessage}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-amber-500 px-6 py-3 rounded-xl flex-row items-center active:bg-amber-600"
        >
          <RefreshCw size={18} color="#000" />
          <Text className="text-black font-semibold ml-2">{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      {icon ? (
        <View className="mb-6">{icon}</View>
      ) : (
        <View className="bg-gray-800/50 rounded-full p-6 mb-6">
          <Package size={48} color="#6B7280" />
        </View>
      )}
      <Text className="text-white text-xl font-bold text-center mb-2">
        {title}
      </Text>
      {message && (
        <Text className="text-gray-400 text-center mb-6">{message}</Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-amber-500 px-6 py-3 rounded-xl active:bg-amber-600"
        >
          <Text className="text-black font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

interface NetworkErrorBannerProps {
  visible: boolean;
  onRetry?: () => void;
}

export function NetworkErrorBanner({ visible, onRetry }: NetworkErrorBannerProps) {
  if (!visible) return null;

  return (
    <View className="bg-red-900/90 px-4 py-3 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <WifiOff size={18} color="#FCA5A5" />
        <Text className="text-red-200 ml-2 flex-1">No internet connection</Text>
      </View>
      {onRetry && (
        <Pressable onPress={onRetry} className="ml-2">
          <Text className="text-red-200 font-semibold">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
