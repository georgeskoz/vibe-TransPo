import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  UtensilsCrossed, ChevronLeft, Search, Star, Clock, MapPin,
  Plus, Minus, ShoppingBag, ChevronRight, X, Flame, Leaf
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/lib/i18n';
import { formatCurrency, calculateDeliveryFee, QUEBEC_TAXES } from '@/lib/quebec-taxi';
import { cn } from '@/lib/cn';
import * as Haptics from 'expo-haptics';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  cuisineEn: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: number;
  promo?: string;
}

interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const categories = [
  { id: 'all', nameFr: 'Tout', nameEn: 'All', icon: '🍽️' },
  { id: 'pizza', nameFr: 'Pizza', nameEn: 'Pizza', icon: '🍕' },
  { id: 'sushi', nameFr: 'Sushi', nameEn: 'Sushi', icon: '🍣' },
  { id: 'burger', nameFr: 'Burgers', nameEn: 'Burgers', icon: '🍔' },
  { id: 'poutine', nameFr: 'Poutine', nameEn: 'Poutine', icon: '🍟' },
  { id: 'asian', nameFr: 'Asiatique', nameEn: 'Asian', icon: '🥡' },
  { id: 'healthy', nameFr: 'Santé', nameEn: 'Healthy', icon: '🥗' },
];

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'La Belle Province',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    cuisine: 'Québécois • Poutine',
    cuisineEn: 'Québécois • Poutine',
    rating: 4.7,
    deliveryTime: '25-35',
    deliveryFee: 3.99,
    distance: 2.1,
    promo: '-20%',
  },
  {
    id: '2',
    name: 'Sushi Montréal',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    cuisine: 'Japonais • Sushi',
    cuisineEn: 'Japanese • Sushi',
    rating: 4.8,
    deliveryTime: '30-40',
    deliveryFee: 4.99,
    distance: 3.5,
  },
  {
    id: '3',
    name: 'Pizza Napoli',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    cuisine: 'Italien • Pizza',
    cuisineEn: 'Italian • Pizza',
    rating: 4.6,
    deliveryTime: '20-30',
    deliveryFee: 2.99,
    distance: 1.8,
    promo: 'Livraison gratuite',
  },
  {
    id: '4',
    name: 'Burger Bar MTL',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    cuisine: 'Américain • Burgers',
    cuisineEn: 'American • Burgers',
    rating: 4.5,
    deliveryTime: '25-35',
    deliveryFee: 3.49,
    distance: 2.8,
  },
  {
    id: '5',
    name: 'Pho Saigon',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    cuisine: 'Vietnamien • Soupe',
    cuisineEn: 'Vietnamese • Soup',
    rating: 4.9,
    deliveryTime: '30-40',
    deliveryFee: 4.49,
    distance: 4.2,
  },
];

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Poutine Classique',
    nameEn: 'Classic Poutine',
    description: 'Frites, fromage en grains, sauce brune',
    descriptionEn: 'Fries, cheese curds, brown gravy',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1578424646215-be6ad67da9ac?w=200',
    popular: true,
  },
  {
    id: '2',
    name: 'Poutine Montréal',
    nameEn: 'Montreal Poutine',
    description: 'Viande fumée, fromage en grains, sauce',
    descriptionEn: 'Smoked meat, cheese curds, gravy',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=200',
    popular: true,
  },
  {
    id: '3',
    name: 'Hot Dog Steamé',
    nameEn: 'Steamed Hot Dog',
    description: 'Pain vapeur, saucisse, moutarde, chou',
    descriptionEn: 'Steamed bun, sausage, mustard, coleslaw',
    price: 6.99,
    image: 'https://images.unsplash.com/photo-1612392166886-ee8475b03571?w=200',
  },
  {
    id: '4',
    name: 'Hamburger Deluxe',
    nameEn: 'Deluxe Burger',
    description: 'Boeuf, fromage, bacon, laitue, tomate',
    descriptionEn: 'Beef, cheese, bacon, lettuce, tomato',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    spicy: true,
  },
  {
    id: '5',
    name: 'Salade César',
    nameEn: 'Caesar Salad',
    description: 'Laitue romaine, parmesan, croûtons',
    descriptionEn: 'Romaine lettuce, parmesan, croutons',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200',
    vegetarian: true,
  },
];

export default function FoodScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [step, setStep] = useState<'browse' | 'restaurant' | 'cart'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = cartTotal >= 35 ? 0 : 4.99;
  const taxes = (cartTotal + deliveryFee) * QUEBEC_TAXES.TOTAL_TAX_RATE;
  const orderTotal = cartTotal + deliveryFee + taxes;

  const addToCart = (item: MenuItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRestaurant(restaurant);
    setStep('restaurant');
  };

  const handlePlaceOrder = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/trip');
  };

  const renderBrowse = () => (
    <>
      {/* Search */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5"
      >
        <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 py-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={language === 'fr' ? 'Rechercher un restaurant...' : 'Search restaurants...'}
            placeholderTextColor="#6B7280"
            className="flex-1 text-white ml-3"
          />
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="mt-5"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          style={{ flexGrow: 0 }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-3 rounded-full flex-row items-center',
                  isSelected
                    ? 'bg-rose-500'
                    : 'bg-white/5 border border-white/10'
                )}
              >
                <Text className="mr-2">{cat.icon}</Text>
                <Text className={cn(
                  'font-medium',
                  isSelected ? 'text-white' : 'text-gray-400'
                )}>
                  {language === 'fr' ? cat.nameFr : cat.nameEn}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Restaurants */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        className="px-5 mt-6"
      >
        <Text className="text-white font-semibold mb-4">
          {language === 'fr' ? 'Restaurants populaires' : 'Popular restaurants'}
        </Text>
        <View className="gap-4">
          {restaurants.map((restaurant, index) => (
            <Animated.View
              key={restaurant.id}
              entering={SlideInRight.duration(300).delay(index * 50)}
            >
              <Pressable
                onPress={() => handleSelectRestaurant(restaurant)}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <View className="h-36 bg-gray-800 relative">
                  <Image
                    source={{ uri: restaurant.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {restaurant.promo && (
                    <View className="absolute top-3 left-3 bg-rose-500 px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">{restaurant.promo}</Text>
                    </View>
                  )}
                </View>
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-bold text-lg">{restaurant.name}</Text>
                    <View className="flex-row items-center bg-white/10 px-2 py-1 rounded-full">
                      <Star size={12} color="#FFB800" fill="#FFB800" />
                      <Text className="text-amber-400 text-sm ml-1 font-medium">
                        {restaurant.rating}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-gray-400 text-sm mt-1">
                    {language === 'fr' ? restaurant.cuisine : restaurant.cuisineEn}
                  </Text>
                  <View className="flex-row items-center mt-3">
                    <Clock size={14} color="#9CA3AF" />
                    <Text className="text-gray-400 text-sm ml-1">{restaurant.deliveryTime} min</Text>
                    <Text className="text-gray-600 mx-2">•</Text>
                    <Text className="text-gray-400 text-sm">
                      {restaurant.deliveryFee === 0
                        ? (language === 'fr' ? 'Livraison gratuite' : 'Free delivery')
                        : formatCurrency(restaurant.deliveryFee, language)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <View className="h-8" />
    </>
  );

  const renderRestaurant = () => (
    <>
      {/* Restaurant Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5"
      >
        <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <View className="h-40 bg-gray-800">
            <Image
              source={{ uri: selectedRestaurant?.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="p-4">
            <Text className="text-white font-bold text-xl">{selectedRestaurant?.name}</Text>
            <View className="flex-row items-center mt-2">
              <Star size={14} color="#FFB800" fill="#FFB800" />
              <Text className="text-amber-400 ml-1">{selectedRestaurant?.rating}</Text>
              <Text className="text-gray-600 mx-2">•</Text>
              <Clock size={14} color="#9CA3AF" />
              <Text className="text-gray-400 ml-1">{selectedRestaurant?.deliveryTime} min</Text>
              <Text className="text-gray-600 mx-2">•</Text>
              <MapPin size={14} color="#9CA3AF" />
              <Text className="text-gray-400 ml-1">{selectedRestaurant?.distance} km</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Menu Items */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="px-5 mt-6"
      >
        <Text className="text-white font-semibold mb-4">Menu</Text>
        <View className="gap-4">
          {menuItems.map((item, index) => {
            const cartItem = cart.find((i) => i.id === item.id);
            return (
              <Animated.View
                key={item.id}
                entering={SlideInRight.duration(300).delay(index * 50)}
              >
                <View className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row">
                  <View className="flex-1 pr-4">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-semibold">
                        {language === 'fr' ? item.name : item.nameEn}
                      </Text>
                      {item.popular && (
                        <View className="bg-amber-500/20 px-2 py-0.5 rounded-full">
                          <Text className="text-amber-400 text-xs">
                            {language === 'fr' ? 'Populaire' : 'Popular'}
                          </Text>
                        </View>
                      )}
                      {item.spicy && <Flame size={14} color="#EF4444" />}
                      {item.vegetarian && <Leaf size={14} color="#10B981" />}
                    </View>
                    <Text className="text-gray-400 text-sm mt-1">
                      {language === 'fr' ? item.description : item.descriptionEn}
                    </Text>
                    <Text className="text-rose-400 font-bold mt-2">
                      {formatCurrency(item.price, language)}
                    </Text>
                  </View>
                  <View className="items-center justify-center">
                    <View className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden mb-2">
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    {cartItem ? (
                      <View className="flex-row items-center bg-rose-500 rounded-full">
                        <Pressable
                          onPress={() => removeFromCart(item.id)}
                          className="p-2"
                        >
                          <Minus size={16} color="#fff" />
                        </Pressable>
                        <Text className="text-white font-bold px-2">{cartItem.quantity}</Text>
                        <Pressable
                          onPress={() => addToCart(item)}
                          className="p-2"
                        >
                          <Plus size={16} color="#fff" />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => addToCart(item)}
                        className="bg-rose-500/20 border border-rose-500/50 rounded-full p-2"
                      >
                        <Plus size={20} color="#F43F5E" />
                      </Pressable>
                    )}
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      <View className="h-32" />
    </>
  );

  const renderCart = () => (
    <>
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="px-5"
      >
        <Text className="text-white font-semibold mb-4">
          {language === 'fr' ? 'Votre commande' : 'Your order'}
        </Text>

        {cart.length === 0 ? (
          <View className="bg-white/5 border border-white/10 rounded-2xl p-8 items-center">
            <ShoppingBag size={48} color="#6B7280" />
            <Text className="text-gray-400 mt-4">
              {language === 'fr' ? 'Votre panier est vide' : 'Your cart is empty'}
            </Text>
          </View>
        ) : (
          <View className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {cart.map((item, index) => (
              <View
                key={item.id}
                className={cn(
                  'flex-row items-center p-4',
                  index < cart.length - 1 && 'border-b border-white/5'
                )}
              >
                <View className="w-16 h-16 bg-gray-800 rounded-xl overflow-hidden mr-4">
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-medium">
                    {language === 'fr' ? item.name : item.nameEn}
                  </Text>
                  <Text className="text-rose-400 font-bold mt-1">
                    {formatCurrency(item.price * item.quantity, language)}
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/10 rounded-full">
                  <Pressable
                    onPress={() => removeFromCart(item.id)}
                    className="p-2"
                  >
                    <Minus size={16} color="#fff" />
                  </Pressable>
                  <Text className="text-white font-bold px-2">{item.quantity}</Text>
                  <Pressable
                    onPress={() => addToCart(item)}
                    className="p-2"
                  >
                    <Plus size={16} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Order Summary */}
      {cart.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          className="px-5 mt-4"
        >
          <View className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">{t('subtotal')}</Text>
              <Text className="text-white">{formatCurrency(cartTotal, language)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">{t('deliveryFee')}</Text>
              <Text className={deliveryFee === 0 ? 'text-emerald-400' : 'text-white'}>
                {deliveryFee === 0
                  ? (language === 'fr' ? 'Gratuit' : 'Free')
                  : formatCurrency(deliveryFee, language)}
              </Text>
            </View>
            {cartTotal < 35 && (
              <Text className="text-gray-500 text-xs mb-2">
                {language === 'fr'
                  ? `Ajoutez ${formatCurrency(35 - cartTotal, language)} pour la livraison gratuite`
                  : `Add ${formatCurrency(35 - cartTotal, language)} for free delivery`}
              </Text>
            )}
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">{t('taxes')}</Text>
              <Text className="text-white">{formatCurrency(taxes, language)}</Text>
            </View>
            <View className="border-t border-rose-500/30 pt-3 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-white font-bold text-lg">{t('total')}</Text>
                <Text className="text-rose-400 font-bold text-xl">
                  {formatCurrency(orderTotal, language)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      <View className="h-32" />
    </>
  );

  return (
    <View className="flex-1 bg-zinc-950">
      <LinearGradient
        colors={['#1a0a0a', '#2d1515', '#1a0a0a']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-5 pt-4 pb-4 flex-row items-center">
          <Pressable
            onPress={() => {
              if (step === 'cart') setStep('restaurant');
              else if (step === 'restaurant') setStep('browse');
              else router.back();
            }}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-3"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              {step === 'cart'
                ? (language === 'fr' ? 'Panier' : 'Cart')
                : step === 'restaurant'
                ? selectedRestaurant?.name
                : t('restaurants')}
            </Text>
            <Text className="text-rose-400 text-sm">{t('foodDelivery')}</Text>
          </View>
          {step !== 'cart' && cartCount > 0 && (
            <Pressable
              onPress={() => setStep('cart')}
              className="relative"
            >
              <View className="w-12 h-12 bg-rose-500/20 rounded-full items-center justify-center">
                <ShoppingBag size={24} color="#F43F5E" />
              </View>
              <View className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{cartCount}</Text>
              </View>
            </Pressable>
          )}
          {step === 'browse' && (
            <View className="w-12 h-12 bg-rose-500/20 rounded-full items-center justify-center">
              <UtensilsCrossed size={24} color="#F43F5E" />
            </View>
          )}
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {step === 'browse' && renderBrowse()}
          {step === 'restaurant' && renderRestaurant()}
          {step === 'cart' && renderCart()}
        </ScrollView>

        {/* Cart Button (when viewing restaurant/menu) */}
        {step === 'restaurant' && cartCount > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            className="absolute bottom-0 left-0 right-0 p-5 pb-8"
          >
            <LinearGradient
              colors={['transparent', '#1a0a0a']}
              style={{ position: 'absolute', left: 0, right: 0, top: -40, bottom: 0 }}
            />
            <Pressable
              onPress={() => setStep('cart')}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#F43F5E', '#E11D48']}
                style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">{cartCount}</Text>
                  </View>
                  <Text className="text-white font-bold text-lg">
                    {language === 'fr' ? 'Voir le panier' : 'View cart'}
                  </Text>
                </View>
                <Text className="text-white font-bold text-lg">
                  {formatCurrency(cartTotal, language)}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Place Order Button (when in cart) */}
        {step === 'cart' && cart.length > 0 && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            className="absolute bottom-0 left-0 right-0 p-5 pb-8"
          >
            <LinearGradient
              colors={['transparent', '#1a0a0a']}
              style={{ position: 'absolute', left: 0, right: 0, top: -40, bottom: 0 }}
            />
            <Pressable
              onPress={handlePlaceOrder}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#F43F5E', '#E11D48']}
                style={{ padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                <ShoppingBag size={24} color="#fff" />
                <Text className="text-white text-lg font-bold ml-3">
                  {t('orderFood')} • {formatCurrency(orderTotal, language)}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
