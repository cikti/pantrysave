import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Reservation {
  id: string;
  user_id: string;
  listing_id: string;
  status: "reserved" | "collected";
  delivery_type: string | null;
  delivery_service: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  listing?: {
    name: string;
    image_url: string | null;
    discount_price: number;
    original_price: number;
    weight: string | null;
    condition: string | null;
    delivery_type: string;
    delivery_service: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export function useReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reservations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reservations")
        .select("*, listings(name, image_url, discount_price, original_price, weight, condition, delivery_type, delivery_service, address, latitude, longitude)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...r,
        listing: r.listings,
      })) as Reservation[];
    },
    enabled: !!user,
  });

  const createReservation = useMutation({
    mutationFn: async (input: {
      listing_id: string;
      delivery_type?: string;
      delivery_service?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("reservations").insert({
        user_id: user.id,
        listing_id: input.listing_id,
        delivery_type: input.delivery_type || null,
        delivery_service: input.delivery_service || null,
        address: input.address || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  const markCollected = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "collected" as any })
        .eq("id", reservationId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservations"] }),
  });

  return {
    reservations: query.data || [],
    loading: query.isLoading,
    createReservation: createReservation.mutateAsync,
    markCollected: markCollected.mutateAsync,
  };
}
