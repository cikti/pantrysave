import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Voucher {
  id: string;
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_spend: number;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  voucher_type: "claimable" | "system";
  points_cost: number;
}

export interface UserVoucher {
  id: string;
  user_id: string;
  voucher_id: string;
  is_used: boolean;
  voucher?: Voucher;
}

export function useVouchers() {
  return useQuery({
    queryKey: ["vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as Voucher[];
    },
  });
}

export function useClaimableVouchers() {
  return useQuery({
    queryKey: ["vouchers", "claimable"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("is_active", true)
        .eq("voucher_type", "claimable");
      if (error) throw error;
      return (data || []) as Voucher[];
    },
  });
}

export function useUserVouchers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_vouchers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_vouchers")
        .select("*, vouchers(*)")
        .eq("user_id", user!.id)
        .eq("is_used", false);
      if (error) throw error;
      return (data || []).map((uv: any) => ({
        ...uv,
        voucher: uv.vouchers,
      })) as UserVoucher[];
    },
  });
}

export function useClaimVoucher() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (voucherId: string) => {
      if (!user) throw new Error("Not logged in");
      const { error } = await supabase
        .from("user_vouchers")
        .insert({ user_id: user.id, voucher_id: voucherId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_vouchers"] }),
  });
}

export function useRedeemVoucherCode() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Not logged in");
      // Find voucher by code
      const { data: voucher, error: findErr } = await supabase
        .from("vouchers")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .eq("is_active", true)
        .eq("voucher_type", "system")
        .maybeSingle();
      if (findErr) throw findErr;
      if (!voucher) throw new Error("Invalid voucher code");
      // Check if already claimed
      const { data: existing } = await supabase
        .from("user_vouchers")
        .select("id")
        .eq("user_id", user.id)
        .eq("voucher_id", voucher.id)
        .maybeSingle();
      if (existing) throw new Error("You already have this voucher");
      // Check expiry
      if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
        throw new Error("This voucher has expired");
      }
      // Claim it
      const { error } = await supabase
        .from("user_vouchers")
        .insert({ user_id: user.id, voucher_id: voucher.id });
      if (error) throw error;
      return voucher as Voucher;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_vouchers"] }),
  });
}

export function useMarkVoucherUsed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userVoucherId: string) => {
      const { error } = await supabase
        .from("user_vouchers")
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq("id", userVoucherId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_vouchers"] }),
  });
}

export function calculateDiscount(voucher: Voucher, subtotal: number): number {
  if (subtotal < voucher.min_spend) return 0;
  if (voucher.discount_type === "percentage") {
    return Math.round(subtotal * voucher.discount_value / 100 * 100) / 100;
  }
  return Math.min(voucher.discount_value, subtotal);
}
