import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type OrderStatus = "pending" | "packing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
  weight?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  deliveryMethod: string;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  sellerNames: string[];
  timeline: { status: OrderStatus; date: string }[];
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status" | "timeline">) => Order;
  cancelOrder: (id: string) => void;
  orderCount: number;
}

const STORAGE_KEY = "pantrysave_orders";
const OrderContext = createContext<OrderContextType | undefined>(undefined);

function generateOrderId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `#PS${yy}${mm}${dd}${rand}`;
}

function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((data: Omit<Order, "id" | "createdAt" | "status" | "timeline">) => {
    const now = new Date().toISOString();
    const order: Order = {
      ...data,
      id: generateOrderId(),
      status: "pending",
      createdAt: now,
      timeline: [{ status: "pending", date: now }],
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && (o.status === "pending" || o.status === "packing")
          ? { ...o, status: "cancelled" as OrderStatus, timeline: [...o.timeline, { status: "cancelled" as OrderStatus, date: new Date().toISOString() }] }
          : o
      )
    );
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, cancelOrder, orderCount: orders.length }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
