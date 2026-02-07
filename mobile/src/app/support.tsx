import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp, FadeIn, SlideInRight } from 'react-native-reanimated';
import {
  ArrowLeft,
  Send,
  MessageCircle,
  HelpCircle,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
  Bot,
  User,
  Phone,
} from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'trip',
    icon: <MapPin size={20} color="#FBBF24" />,
    title: 'Trip Issue',
    subtitle: 'Problems with a recent ride',
  },
  {
    id: 'payment',
    icon: <CreditCard size={20} color="#FBBF24" />,
    title: 'Payment Help',
    subtitle: 'Billing, refunds, payment methods',
  },
  {
    id: 'account',
    icon: <User size={20} color="#FBBF24" />,
    title: 'Account & Settings',
    subtitle: 'Profile, password, preferences',
  },
  {
    id: 'safety',
    icon: <AlertCircle size={20} color="#EF4444" />,
    title: 'Safety Concern',
    subtitle: 'Report a safety issue',
  },
];

const automatedResponses: Record<string, string[]> = {
  greeting: [
    "Hi! I'm your TransPo support assistant. How can I help you today?",
    "You can ask me about trips, payments, account issues, or anything else!",
  ],
  trip: [
    "I understand you're having an issue with a trip. Let me help!",
    "Could you tell me more about what happened? For example:\n• Driver didn't arrive\n• Route was wrong\n• Item left in vehicle\n• Fare dispute",
  ],
  payment: [
    "I can help with payment issues!",
    "Common questions I can assist with:\n• Request a refund\n• Update payment method\n• View past receipts\n• Promo code issues",
    "What specifically do you need help with?",
  ],
  account: [
    "I can help you with account settings!",
    "What would you like to do?\n• Change phone/email\n• Update profile\n• Delete account\n• Privacy settings",
  ],
  safety: [
    "Your safety is our top priority.",
    "For immediate emergencies, please call 911.",
    "For non-emergency safety concerns, please describe what happened and I'll connect you with our safety team.",
  ],
  default: [
    "Thanks for reaching out! I'm processing your request.",
    "A support agent will follow up within 24 hours. Is there anything else I can help with?",
  ],
};

export default function SupportChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Initial greeting
    addBotMessages(automatedResponses.greeting);
  }, []);

  const addBotMessages = async (texts: string[]) => {
    setIsTyping(true);
    for (const text of texts) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    }
    setIsTyping(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false);
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text: action.title,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const responses =
      automatedResponses[action.id as keyof typeof automatedResponses] ||
      automatedResponses.default;
    addBotMessages(responses);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    setShowQuickActions(false);
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Simple keyword matching for responses
    const lowerText = inputText.toLowerCase();
    let responseKey = 'default';
    if (lowerText.includes('trip') || lowerText.includes('ride') || lowerText.includes('driver')) {
      responseKey = 'trip';
    } else if (lowerText.includes('pay') || lowerText.includes('refund') || lowerText.includes('charge')) {
      responseKey = 'payment';
    } else if (lowerText.includes('account') || lowerText.includes('profile') || lowerText.includes('password')) {
      responseKey = 'account';
    } else if (lowerText.includes('safety') || lowerText.includes('emergency') || lowerText.includes('unsafe')) {
      responseKey = 'safety';
    }

    addBotMessages(automatedResponses[responseKey]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b border-gray-800 bg-gray-900"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#fff" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-white text-lg font-bold">Support</Text>
          <Text className="text-green-500 text-xs">Online • Usually replies in minutes</Text>
        </View>
        <Pressable className="p-2 -mr-2">
          <Phone size={24} color="#FBBF24" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          {showQuickActions && (
            <Animated.View entering={FadeIn.duration(300)} className="mb-6">
              <Text className="text-gray-400 text-sm mb-3">How can we help?</Text>
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.id}
                  entering={SlideInRight.delay(index * 100).duration(300)}
                >
                  <Pressable
                    onPress={() => handleQuickAction(action)}
                    className="bg-gray-800 rounded-xl p-4 mb-2 flex-row items-center active:bg-gray-700"
                  >
                    <View className="bg-gray-700 rounded-full p-2">{action.icon}</View>
                    <View className="flex-1 ml-3">
                      <Text className="text-white font-medium">{action.title}</Text>
                      <Text className="text-gray-400 text-sm">{action.subtitle}</Text>
                    </View>
                    <ChevronRight size={20} color="#6B7280" />
                  </Pressable>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <Animated.View
              key={message.id}
              entering={FadeInUp.duration(300)}
              className={`mb-3 ${message.isUser ? 'items-end' : 'items-start'}`}
            >
              <View className="flex-row items-end max-w-[85%]">
                {!message.isUser && (
                  <View className="bg-amber-500 rounded-full p-1.5 mr-2 mb-1">
                    <Bot size={16} color="#000" />
                  </View>
                )}
                <View
                  className={`rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-amber-500 rounded-br-md'
                      : 'bg-gray-800 rounded-bl-md'
                  }`}
                >
                  <Text
                    className={message.isUser ? 'text-black' : 'text-white'}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-500 text-xs mt-1 mx-10">
                {formatTime(message.timestamp)}
              </Text>
            </Animated.View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <Animated.View entering={FadeIn.duration(200)} className="flex-row items-center">
              <View className="bg-amber-500 rounded-full p-1.5 mr-2">
                <Bot size={16} color="#000" />
              </View>
              <View className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-gray-500 mr-1 animate-pulse" />
                <View className="w-2 h-2 rounded-full bg-gray-500 mr-1 animate-pulse" />
                <View className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          className="px-4 py-3 border-t border-gray-800 bg-gray-900"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-row items-center bg-gray-800 rounded-2xl px-4">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#6B7280"
              multiline
              className="flex-1 text-white py-3 max-h-24"
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`ml-2 p-2 rounded-full ${
                inputText.trim() ? 'bg-amber-500' : 'bg-gray-700'
              }`}
            >
              <Send size={20} color={inputText.trim() ? '#000' : '#6B7280'} />
            </Pressable>
          </View>

          {/* Help Text */}
          <View className="flex-row items-center justify-center mt-3">
            <HelpCircle size={14} color="#6B7280" />
            <Text className="text-gray-500 text-xs ml-1">
              For emergencies, call 911
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
