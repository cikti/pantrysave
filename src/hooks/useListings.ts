import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Listing = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  condition: string | null;
  weight: string | null;
  original_price: number;
  discount_price: number;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  delivery_type: "pickup" | "third_party";
  delivery_service: string | null;
  delivery_fee: number | null;
  seller_name: string | null;
  status: "available" | "reserved" | "sold";
  reason: string | null;
  expiry_days: number | null;
  pricing_type: string;
  price_per_unit: number | null;
  unit_type: string;
  max_quantity: number | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type CreateListingInput = {
  name: string;
  category?: string;
  condition?: string;
  weight?: string;
  original_price: number;
  discount_price: number;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  delivery_type: "pickup" | "third_party";
  delivery_service?: string;
  delivery_fee?: number;
  seller_name?: string;
  reason?: string;
  expiry_days?: number;
  pricing_type?: string;
  price_per_unit?: number;
  unit_type?: string;
  max_quantity?: number;
  stock_quantity?: number;
};

export function useListings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("listings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["listings"] });
          queryClient.invalidateQueries({ queryKey: ["listing"] });
          queryClient.invalidateQueries({ queryKey: ["my-listings"] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });
}

export function useListingById(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Listing | null;
    },
    enabled: !!id,
  });
}

export function useMyListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
    enabled: !!user,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("listings")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "available" | "reserved" | "sold" }) => {
      const { error } = await supabase
        .from("listings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function usePurchaseListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase.rpc("purchase_listing", {
        p_listing_id: id,
        p_quantity: quantity,
      });
      if (error) throw error;
      return data as { new_stock: number; new_status: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
