import { useEffect, useRef, useState } from "react";
import { X, Send, Check, CheckCheck, Paperclip, Smile, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat, type ProductContext } from "@/contexts/ChatContext";
import { useConversations, useMessages, useSendMessage, useCreateConversation, type Conversation } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { format } from "date-fns";

const EMOJI_LIST = ["😊", "👍", "❤️", "😂", "🤔", "👋", "🙏", "✅", "🔥", "💯", "😍", "🎉"];

const ChatDrawer = () => {
  const { isOpen, closeChat, activeConversationId, productContext } = useChat();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { conversations, loading: convosLoading, refetch: refetchConvos } = useConversations();
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(activeConversationId);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputText, setInputText] = useState("");
  const { messages, loading: msgsLoading } = useMessages(selectedConvoId);
  const sendMessage = useSendMessage();
  const createConversation = useCreateConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showConvoList, setShowConvoList] = useState(true);

  useEffect(() => {
    if (!isOpen || !productContext || !user) return;
    (async () => {
      const convoId = await createConversation(
        productContext.sellerId,
        productContext.productId,
        productContext.productName,
        productContext.productImage
      );
      if (convoId) {
        setSelectedConvoId(convoId);
        setShowConvoList(false);
        refetchConvos();
      }
    })();
  }, [isOpen, productContext, user]);

  useEffect(() => {
    if (activeConversationId) {
      setSelectedConvoId(activeConversationId);
      setShowConvoList(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedConvoId(null);
      setShowConvoList(true);
      setInputText("");
      setShowEmojiPicker(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConvoId) return;
    const text = inputText.trim();
    setInputText("");
    setShowEmojiPicker(false);
    await sendMessage(selectedConvoId, text);
    refetchConvos();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMockImage = () => {
    toast.info("Image sharing coming soon!", { description: "This feature is under development" });
  };

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);

  if (!isOpen) return null;

  const drawerWidth = isMobile ? "100vw" : "420px";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ width: drawerWidth }}
            className="fixed top-0 right-0 h-full bg-background z-50 shadow-2xl flex"
          >
            {/* Conversation list */}
            {(!isMobile || showConvoList) && (
              <div className={`${isMobile ? "w-full" : "w-[160px] min-w-[160px] border-r border-border"} flex flex-col`}>
                <div className="h-14 flex items-center justify-between px-3 border-b border-border shrink-0">
                  <h3 className="text-sm font-bold text-foreground">Chats</h3>
                  <button onClick={closeChat} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {convosLoading ? (
                    <div className="p-4 text-xs text-muted-foreground">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">No conversations yet</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">Start chatting from a product page</p>
                    </div>
                  ) : (
                    conversations.map((convo) => (
                      <ConversationItem
                        key={convo.id}
                        convo={convo}
                        isActive={selectedConvoId === convo.id}
                        onClick={() => {
                          setSelectedConvoId(convo.id);
                          if (isMobile) setShowConvoList(false);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chat window */}
            {(!isMobile || !showConvoList) && (
              <div className="flex-1 flex flex-col min-w-0">
                <ChatHeader
                  convo={selectedConvo}
                  productContext={productContext}
                  isMobile={isMobile}
                  onBack={() => setShowConvoList(true)}
                  onClose={closeChat}
                />

                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/30">
                  {!selectedConvoId ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">Select a conversation</p>
                    </div>
                  ) : msgsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-muted-foreground">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">Say hello! 👋</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedConvoId && (
                  <div className="border-t border-border p-3 shrink-0">
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mb-2"
                        >
                          <div className="flex flex-wrap gap-1.5 p-2 bg-muted rounded-xl">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setInputText((v) => v + emoji)}
                                className="text-lg hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEmojiPicker((v) => !v)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                      >
                        <Smile size={18} />
                      </button>
                      <button
                        onClick={handleMockImage}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                      >
                        <Paperclip size={18} />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 h-9 px-3 rounded-full bg-muted border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <motion.button
                        onClick={handleSend}
                        whileTap={{ scale: 0.9 }}
                        disabled={!inputText.trim()}
                        className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Sub-components ---

function ConversationItem({ convo, isActive, onClick }: {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 p-3 text-left transition-colors hover:bg-muted/50 ${isActive ? "bg-muted" : ""}`}
    >
      {/* Other user's avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
        {convo.other_user_avatar ? (
          <img src={convo.other_user_avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {convo.other_user_name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground truncate">{convo.other_user_name}</p>
          {convo.last_message_time && (
            <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
              {format(new Date(convo.last_message_time), "HH:mm")}
            </span>
          )}
        </div>
        <p className="text-[10px] text-primary truncate">{convo.product_name}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{convo.last_message || "No messages yet"}</p>
      </div>
      {(convo.unread_count ?? 0) > 0 && (
        <span className="w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 mt-1">
          {convo.unread_count > 9 ? "9+" : convo.unread_count}
        </span>
      )}
    </button>
  );
}

function ChatHeader({ convo, productContext, isMobile, onBack, onClose }: {
  convo?: Conversation;
  productContext: ProductContext | null;
  isMobile: boolean;
  onBack: () => void;
  onClose: () => void;
}) {
  const name = convo?.other_user_name || productContext?.sellerName || "User";
  const avatar = convo?.other_user_avatar || null;
  const productName = convo?.product_name || productContext?.productName || "";

  return (
    <div className="h-14 flex items-center gap-2.5 px-3 border-b border-border shrink-0">
      {isMobile && (
        <button onClick={onBack} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted">
          <ArrowLeft size={16} />
        </button>
      )}
      {/* User avatar (not product image) */}
      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
        {avatar ? (
          <img src={avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {name[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        {productName && <p className="text-[10px] text-primary truncate">{productName}</p>}
      </div>
      {!isMobile && (
        <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: import("@/hooks/useChat").Message; isOwn: boolean }) {
  const time = format(new Date(msg.created_at), "HH:mm");

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`max-w-[75%] px-3 py-2 rounded-2xl ${
          isOwn
            ? "bg-[#DCF8C6] text-foreground rounded-br-md"
            : "bg-card text-foreground rounded-bl-md shadow-sm"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : ""}`}>
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOwn && (
            msg.is_read ? (
              <CheckCheck size={12} className="text-blue-500" />
            ) : (
              <Check size={12} className="text-muted-foreground" />
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ChatDrawer;
