import { useState } from 'react';
import { api } from '@/lib/api/api';

interface RideRequest {
  id: string;
  userId: string;
  pickupAddress: string;
  destinationAddress: string;
  distance: number;
  estimatedDuration: number;
  estimatedFare: number;
  rideType: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export const useCreateRideRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (data: {
    pickupAddress: string;
    destinationAddress: string;
    distance: number;
    estimatedDuration: number;
    estimatedFare: number;
    rideType: string;
  }): Promise<RideRequest | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post<RideRequest>('/api/rides/requests', data);
      return response;
    } catch (err) {
      const message = 'Failed to create ride request';
      setError(message);
      console.error(message, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createRequest, loading, error };
};
