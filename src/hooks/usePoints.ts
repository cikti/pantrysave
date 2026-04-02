import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PointTransaction = {
  id: string;
  user_id: string;
  type: "earn" | "redeem";
  amount: number;
  description: string;
  created_at: string;
};

export const usePoints = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: balance = 0, isLoading: balanceLoading } = useQuery({
    queryKey: ["points-balance", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("user_points")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.balance ?? 0;
    },
    enabled: !!user,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["point-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("point_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as PointTransaction[];
    },
    enabled: !!user,
  });

  const earnPoints = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Upsert balance
      const { data: existing } = await supabase
        .from("user_points")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_points")
          .update({ balance: existing.balance + amount })
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_points")
          .insert({ user_id: user.id, balance: amount });
        if (error) throw error;
      }

      // Log transaction
      const { error: txError } = await supabase
        .from("point_transactions")
        .insert({ user_id: user.id, type: "earn", amount, description });
      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["point-transactions"] });
    },
  });

  const redeemPoints = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (balance < amount) throw new Error("Insufficient points");

      const { error } = await supabase
        .from("user_points")
        .update({ balance: balance - amount })
        .eq("user_id", user.id);
      if (error) throw error;

      const { error: txError } = await supabase
        .from("point_transactions")
        .insert({ user_id: user.id, type: "redeem", amount, description });
      if (txError) throw txError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["point-transactions"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    balance,
    balanceLoading,
    transactions,
    transactionsLoading,
    earnPoints,
    redeemPoints,
  };
};
