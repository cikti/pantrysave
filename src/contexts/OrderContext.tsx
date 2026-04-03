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

const DEMO_ORDERS: Order[] = [
  {
    id: "#PS26040101",
    items: [
      { name: "Premium Rice 5kg", quantity: 1, price: 25.00 },
      { name: "Cooking Oil 1L", quantity: 2, price: 8.50 },
    ],
    totalAmount: 42.00,
    deliveryFee: 0,
    deliveryMethod: "Self Pickup",
    paymentMethod: "FPX (Maybank)",
    status: "delivered",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    sellerNames: ["Kedai Ah Seng"],
    timeline: [
      { status: "pending", date: new Date(Date.now() - 2 * 86400000).toISOString() },
      { status: "packing", date: new Date(Date.now() - 1.5 * 86400000).toISOString() },
      { status: "shipped", date: new Date(Date.now() - 1 * 86400000).toISOString() },
      { status: "out_for_delivery", date: new Date(Date.now() - 0.5 * 86400000).toISOString() },
      { status: "delivered", date: new Date(Date.now() - 0.2 * 86400000).toISOString() },
    ],
  },
  {
    id: "#PS26033002",
    items: [
      { name: "Chicken Thigh Cuts 1kg", quantity: 2, price: 7.90 },
      { name: "Soy Sauce 500ml", quantity: 1, price: 4.50 },
    ],
    totalAmount: 20.30,
    deliveryFee: 0,
    deliveryMethod: "Self Pickup",
    paymentMethod: "FPX (CIMB)",
    status: "shipped",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    sellerNames: ["Ali Minimart"],
    timeline: [
      { status: "pending", date: new Date(Date.now() - 1 * 86400000).toISOString() },
      { status: "packing", date: new Date(Date.now() - 0.8 * 86400000).toISOString() },
      { status: "shipped", date: new Date(Date.now() - 0.5 * 86400000).toISOString() },
    ],
  },
  {
    id: "#PS26032803",
    items: [
      { name: "Organic Eggs (10pcs)", quantity: 1, price: 12.00 },
    ],
    totalAmount: 12.00,
    deliveryFee: 0,
    deliveryMethod: "Self Pickup",
    paymentMethod: "FPX (Public Bank)",
    status: "pending",
    createdAt: new Date(Date.now() - 0.3 * 86400000).toISOString(),
    sellerNames: ["Pasar Taman Sri"],
    timeline: [
      { status: "pending", date: new Date(Date.now() - 0.3 * 86400000).toISOString() },
    ],
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = loadOrders();
    if (saved.length === 0) return [DEMO_ORDER];
    return saved;
  });

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
