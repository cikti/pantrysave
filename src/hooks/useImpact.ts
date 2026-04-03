import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserImpact {
  money_saved: number;
  food_saved: number;
  orders_made: number;
  items_listed: number;
}

const DEFAULT_IMPACT: UserImpact = {
  money_saved: 0,
  food_saved: 0,
  orders_made: 0,
  items_listed: 0,
};

export function useImpact() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-impact", user?.id],
    queryFn: async (): Promise<UserImpact> => {
      if (!user) return DEFAULT_IMPACT;
      const { data, error } = await supabase
        .from("user_impact" as any)
        .select("money_saved, food_saved, orders_made, items_listed")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_IMPACT;
      return data as unknown as UserImpact;
    },
    enabled: !!user,
  });

  const recordPurchase = useMutation({
    mutationFn: async (params: { moneySaved: number; foodSavedKg: number }) => {
      if (!user) throw new Error("Not authenticated");
      const current = query.data || DEFAULT_IMPACT;
      const newData = {
        money_saved: current.money_saved + params.moneySaved,
        food_saved: current.food_saved + params.foodSavedKg,
        orders_made: current.orders_made + 1,
        updated_at: new Date().toISOString(),
      };
      // Upsert
      const { error } = await supabase
        .from("user_impact" as any)
        .upsert(
          { user_id: user.id, ...newData },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-impact"] });
    },
  });

  const incrementItemsListed = useMutation({
    mutationFn: async (delta: number) => {
      if (!user) throw new Error("Not authenticated");
      const current = query.data || DEFAULT_IMPACT;
      const { error } = await supabase
        .from("user_impact" as any)
        .upsert(
          {
            user_id: user.id,
            items_listed: Math.max(0, current.items_listed + delta),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-impact"] });
    },
  });

  return {
    impact: query.data || DEFAULT_IMPACT,
    loading: query.isLoading,
    recordPurchase,
    incrementItemsListed,
  };
}
