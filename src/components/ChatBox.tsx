import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  X,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ── */
export interface ChatMessage {
  id: string;
  text: string;
  sender: "buyer" | "seller";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  imageUrl?: string;
}

interface ChatBoxProps {
  sellerName?: string;
  sellerAvatar?: string;
  sellerOnline?: boolean;
  orderId?: string;
  initialMessages?: ChatMessage[];
}

/* ── Helpers ── */
const now = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    text: "Hello, is this item still available?",
    sender: "buyer",
    timestamp: "10:30 AM",
    status: "read",
  },
  {
    id: "m2",
    text: "Yes it is! Would you like to reserve it?",
    sender: "seller",
    timestamp: "10:31 AM",
    status: "read",
  },
  {
    id: "m3",
    text: "Great! Can I pick it up tomorrow?",
    sender: "buyer",
    timestamp: "10:32 AM",
    status: "read",
  },
  {
    id: "m4",
    text: "Sure, anytime after 2 PM works for me 😊",
    sender: "seller",
    timestamp: "10:33 AM",
    status: "read",
  },
];

const EMOJI_SET = ["😊", "👍", "❤️", "🙏", "😂", "🔥", "✅", "🎉", "💯", "🤝", "🌿", "🍀"];

/* ── Tick icon ── */
const StatusIcon = ({ status }: { status: ChatMessage["status"] }) => {
  if (status === "sent") return <Check size={12} className="text-muted-foreground/60" />;
  if (status === "delivered")
    return <CheckCheck size={12} className="text-muted-foreground/60" />;
  return <CheckCheck size={12} className="text-primary" />;
};

/* ── Component ── */
const ChatBox = ({
  sellerName = "Local Seller",
  sellerAvatar,
  sellerOnline = true,
  orderId,
  initialMessages,
}: ChatBoxProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages ?? DEMO_MESSAGES
  );
  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* auto-scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* focus input on open */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setUnread(0);
    }
  }, [open]);

  /* simulate seller reply */
  const simulateReply = useCallback(() => {
    setTyping(true);
    const replies = [
      "Sure, I can arrange that! 😊",
      "Let me check and get back to you.",
      "Sounds good! See you then 👍",
      "The item is in great condition, don't worry!",
      "I'll keep it reserved for you 🌿",
    ];
    setTimeout(() => {
      setTyping(false);
      const reply: ChatMessage = {
        id: `msg-${Date.now()}`,
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: "seller",
        timestamp: now(),
        status: "read",
      };
      setMessages((prev) => [...prev, reply]);
      if (!open) setUnread((u) => u + 1);
    }, 1500 + Math.random() * 1000);
  }, [open]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text,
      sender: "buyer",
      timestamp: now(),
      status: "sent",
    };
    setMessages((prev) => [...prev, msg]);
    setDraft("");
    setShowEmoji(false);

    // mark delivered after 500ms
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    // simulate seller reply
    simulateReply();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMockImage = () => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: "📷 Image attached",
      sender: "buyer",
      timestamp: now(),
      status: "sent",
      imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=150&fit=crop",
    };
    setMessages((prev) => [...prev, msg]);
    simulateReply();
  };

  return (
    <>
      {/* ── Floating button ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          >
            <MessageCircle size={24} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-4 z-50 w-full md:w-[380px] h-[100dvh] md:h-[520px] flex flex-col bg-card rounded-none md:rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* ─ Header ─ */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="relative">
                {sellerAvatar ? (
                  <img
                    src={sellerAvatar}
                    alt={sellerName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-foreground/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {sellerName.charAt(0)}
                  </div>
                )}
                {sellerOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-foreground truncate">
                  {sellerName}
                </p>
                <p className="text-[11px] text-primary-foreground/70">
                  {sellerOnline ? "Online" : "Offline"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-primary-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* ─ Order context ─ */}
            {orderId && (
              <div className="px-4 py-2 bg-muted/50 border-b border-border">
                <p className="text-[11px] text-muted-foreground">
                  📦 Chatting about Order <span className="font-semibold text-foreground">#{orderId}</span>
                </p>
              </div>
            )}

            {/* ─ Messages ─ */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            >
              {messages.map((msg) => {
                const isBuyer = msg.sender === "buyer";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isBuyer ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                        isBuyer
                          ? "bg-primary/15 rounded-br-md"
                          : "bg-card border border-border rounded-bl-md"
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="attachment"
                          className="w-full rounded-lg mb-1.5 object-cover max-h-36"
                        />
                      )}
                      <p className="text-sm text-foreground leading-relaxed">
                        {msg.text}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {msg.timestamp}
                        </span>
                        {isBuyer && <StatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ─ Emoji picker ─ */}
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border bg-card overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 p-3">
                    {EMOJI_SET.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setDraft((d) => d + emoji)}
                        className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center text-lg active:scale-90 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─ Input bar ─ */}
            <div className="px-3 py-2.5 border-t border-border bg-card flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowEmoji((s) => !s)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <Smile size={18} />
              </button>
              <button
                onClick={handleMockImage}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleSend}
                disabled={!draft.trim()}
                className={`p-2.5 rounded-full transition-colors ${
                  draft.trim()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBox;
