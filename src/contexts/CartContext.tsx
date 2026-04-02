import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  listing_id: string;
  quantity: number;
  maxQuantity?: number;
  isMock?: boolean;
  listing?: {
    name: string;
    image_url: string | null;
    discount_price: number;
    original_price: number;
    weight: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  addToCart: (listingId: string, quantity?: number, mockData?: CartItem["listing"], maxQuantity?: number) => Promise<void>;
  removeFromCart: (listingId: string) => Promise<void>;
  updateQuantity: (listingId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const MOCK_CART_KEY = "pantrysave_mock_cart";

function getMockCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(MOCK_CART_KEY) || "[]"); } catch { return []; }
}
function saveMockCart(items: CartItem[]) {
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  total: 0,
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [dbItems, setDbItems] = useState<CartItem[]>([]);
  const [mockItems, setMockItems] = useState<CartItem[]>(getMockCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setDbItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, listing_id, quantity, listings(name, image_url, discount_price, original_price, weight)")
      .eq("user_id", user.id);

    const mapped = (data || []).map((row: any) => ({
      id: row.id,
      listing_id: row.listing_id,
      quantity: row.quantity,
      listing: row.listings,
    }));
    setDbItems(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const items = [...dbItems, ...mockItems];

  const addToCart = async (listingId: string, quantity = 1, mockData?: CartItem["listing"], maxQuantity?: number) => {
    // Mock item (not in DB)
    if (mockData) {
      setMockItems((prev) => {
        const existing = prev.find((i) => i.listing_id === listingId);
        let updated: CartItem[];
        if (existing) {
          updated = prev.map((i) => i.listing_id === listingId ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          updated = [...prev, { id: `mock-${listingId}`, listing_id: listingId, quantity, isMock: true, listing: mockData, maxQuantity }];
        }
        saveMockCart(updated);
        return updated;
      });
      toast.success("Added to cart 🛒");
      return;
    }

    // DB item
    if (!user) { toast.error("Please log in first"); return; }
    const existing = dbItems.find((i) => i.listing_id === listingId);
    if (existing) {
      await updateQuantity(listingId, existing.quantity + quantity);
      return;
    }
    await supabase.from("cart_items").insert({ user_id: user.id, listing_id: listingId, quantity });
    toast.success("Added to cart 🛒");
    fetchCart();
  };

  const removeFromCart = async (listingId: string) => {
    // Check if mock
    if (mockItems.find((i) => i.listing_id === listingId)) {
      setMockItems((prev) => {
        const updated = prev.filter((i) => i.listing_id !== listingId);
        saveMockCart(updated);
        return updated;
      });
      return;
    }
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("listing_id", listingId);
    setDbItems((prev) => prev.filter((i) => i.listing_id !== listingId));
  };

  const updateQuantity = async (listingId: string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(listingId); return; }

    // Mock item
    if (mockItems.find((i) => i.listing_id === listingId)) {
      setMockItems((prev) => {
        const updated = prev.map((i) => i.listing_id === listingId ? { ...i, quantity } : i);
        saveMockCart(updated);
        return updated;
      });
      return;
    }

    if (!user) return;
    await supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("listing_id", listingId);
    setDbItems((prev) => prev.map((i) => i.listing_id === listingId ? { ...i, quantity } : i));
  };

  const clearCart = async () => {
    setMockItems([]);
    saveMockCart([]);
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      setDbItems([]);
    }
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + (i.listing?.discount_price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
