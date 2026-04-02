import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type ChatContextType = {
  isOpen: boolean;
  openChat: (conversationId?: string, productContext?: ProductContext) => void;
  closeChat: () => void;
  activeConversationId: string | null;
  productContext: ProductContext | null;
};

export type ProductContext = {
  productId: string;
  productName: string;
  productImage?: string;
  sellerId: string;
  sellerName: string;
};

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  activeConversationId: null,
  productContext: null,
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [productContext, setProductContext] = useState<ProductContext | null>(null);

  const openChat = useCallback((conversationId?: string, ctx?: ProductContext) => {
    setActiveConversationId(conversationId || null);
    setProductContext(ctx || null);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ChatContext.Provider value={{ isOpen, openChat, closeChat, activeConversationId, productContext }}>
      {children}
    </ChatContext.Provider>
  );
};
