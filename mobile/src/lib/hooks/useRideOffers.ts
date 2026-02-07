import { useEffect, useState } from 'react';
import { api } from '@/lib/api/api';

interface RideOffer {
  id: string;
  rideRequestId: string;
  driverId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  rideRequest: {
    id: string;
    pickupAddress: string;
    destinationAddress: string;
    distance: number;
    estimatedDuration: number;
    estimatedFare: number;
    rideType: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const useRideOffers = (enabled: boolean = true) => {
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await api.get<RideOffer[]>('/api/rides/offers/pending');
        setOffers(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch ride offers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();

    // Poll for new offers every 5 seconds
    const interval = setInterval(fetchOffers, 5000);
    return () => clearInterval(interval);
  }, [enabled]);

  const acceptOffer = async (offerId: string) => {
    try {
      const offer = offers.find(o => o.id === offerId);
      if (!offer) return;

      await api.post(`/api/rides/requests/${offer.rideRequestId}/accept`, {});
      setOffers(offers.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('Failed to accept offer:', err);
    }
  };

  const rejectOffer = async (offerId: string) => {
    try {
      await api.post(`/api/rides/offers/${offerId}/reject`, {});
      setOffers(offers.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('Failed to reject offer:', err);
    }
  };

  return { offers, loading, error, acceptOffer, rejectOffer };
};
