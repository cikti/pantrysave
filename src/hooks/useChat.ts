import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Conversation = {
  id: string;
  seller_id: string;
  buyer_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  last_message: string | null;
  last_message_time: string | null;
  created_at: string;
  // Enriched fields — always refer to the OTHER person
  other_user_name: string;
  other_user_avatar: string | null;
  unread_count: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
};

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_time", { ascending: false });

    if (data) {
      const enriched = await Promise.all(
        data.map(async (c: any) => {
          // Count unread messages (messages not sent by me that are unread)
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", c.id)
            .eq("is_read", false)
            .neq("sender_id", user.id);

          // Determine the OTHER person's ID
          const otherUserId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;

          // Fetch the other person's profile (name + avatar)
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", otherUserId)
            .single();

          return {
            ...c,
            unread_count: count || 0,
            other_user_name: profile?.name || "User",
            other_user_avatar: profile?.avatar_url || null,
          } as Conversation;
        })
      );
      setConversations(enriched);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  return { conversations, loading, refetch: fetchConversations };
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) { setMessages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user) return;
    supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false)
      .then(() => {});
  }, [conversationId, user, messages]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        if (user && (payload.new as Message).sender_id !== user.id) {
          supabase.from("messages").update({ is_read: true }).eq("id", (payload.new as Message).id).then(() => {});
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  return { messages, loading, refetch: fetchMessages };
}

export function useSendMessage() {
  const { user } = useAuth();

  return useCallback(async (conversationId: string, message: string, messageType = "text", imageUrl?: string) => {
    if (!user) return;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message,
      message_type: messageType,
      image_url: imageUrl || null,
    });
    await supabase.from("conversations").update({
      last_message: message,
      last_message_time: new Date().toISOString(),
    }).eq("id", conversationId);
  }, [user]);
}

export function useCreateConversation() {
  const { user } = useAuth();

  return useCallback(async (sellerId: string, productId: string, productName: string, productImage?: string) => {
    if (!user) return null;

    // Check if conversation already exists for this buyer-seller-product combo
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("seller_id", sellerId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) return existing.id;

    const { data } = await supabase.from("conversations").insert({
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: productId,
      product_name: productName,
      product_image: productImage || null,
    }).select("id").single();

    return data?.id || null;
  }, [user]);
}

export function useTotalUnread() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const channelRef = useRef(`unread-count-${Math.random().toString(36).slice(2)}`);

  const fetchUnread = useCallback(async () => {
    if (!user) { setCount(0); return; }
    const { data: convos } = await supabase
      .from("conversations")
      .select("id");
    if (!convos || convos.length === 0) { setCount(0); return; }
    const ids = convos.map((c: any) => c.id);
    const { count: unread } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", ids)
      .eq("is_read", false)
      .neq("sender_id", user.id);
    setCount(unread || 0);
  }, [user]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(channelRef.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        fetchUnread();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnread]);

  return count;
}
