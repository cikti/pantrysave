import { useState } from "react";
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type OrderStatus = "to_pay" | "to_ship" | "to_receive" | "delivered" | "cancelled";

interface Order {
  id: string;
  storeName: string;
  orderDate: string;
  totalItems: number;
  totalAmount: number;
  status: OrderStatus;
  items: string[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  to_pay: { label: "To Pay", color: "bg-amber-100 text-amber-700", icon: <Clock size={14} /> },
  to_ship: { label: "To Ship", color: "bg-blue-100 text-blue-700", icon: <Package size={14} /> },
  to_receive: { label: "To Receive", color: "bg-orange-100 text-orange-700", icon: <Truck size={14} /> },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={14} /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: <XCircle size={14} /> },
};

const TIMELINE_STEPS = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

function getActiveStep(status: OrderStatus): number {
  switch (status) {
    case "to_pay": return 0;
    case "to_ship": return 1;
    case "to_receive": return 3;
    case "delivered": return 4;
    case "cancelled": return -1;
  }
}

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-1001", storeName: "Ali Minimart", orderDate: "2 Apr 2026", totalItems: 2, totalAmount: 28.90, status: "to_receive", items: ["Chicken Thigh Cuts", "Fresh Eggs"] },
  { id: "ORD-1002", storeName: "Kedai Ah Seng", orderDate: "1 Apr 2026", totalItems: 1, totalAmount: 25.00, status: "delivered", items: ["Premium Rice 5kg"] },
  { id: "ORD-1003", storeName: "Pasar Taman Sri", orderDate: "2 Apr 2026", totalItems: 3, totalAmount: 42.00, status: "to_ship", items: ["Cooking Oil", "Soy Sauce", "Sugar 1kg"] },
];

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const handleCancel = (id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o)));
  };

  return (
    <>
      <section className="px-4 md:px-6 mt-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">My Orders</h2>
          <button className="text-xs text-primary font-medium">View All</button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            return (
              <div
                key={order.id}
                className="min-w-[260px] max-w-[300px] snap-center bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground truncate">{order.storeName}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{order.orderDate} · {order.totalItems} item{order.totalItems > 1 ? "s" : ""}</p>
                  <p className="text-sm font-semibold text-foreground">RM{order.totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex gap-2 mt-auto pt-1">
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setTrackingOrder(order)}>
                      Track <ChevronRight size={14} />
                    </Button>
                  )}
                  {(order.status === "to_pay" || order.status === "to_ship") && (
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive" onClick={() => handleCancel(order.id)}>
                      Cancel
                    </Button>
                  )}
                  {order.status === "delivered" && (
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                      <RotateCcw size={14} /> Order Again
                    </Button>
                  )}
                  {order.status === "cancelled" && (
                    <span className="text-xs text-muted-foreground italic">Order cancelled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tracking Timeline Modal */}
      <Dialog open={!!trackingOrder} onOpenChange={() => setTrackingOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Order {trackingOrder?.id}</DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-4">{trackingOrder.storeName} · RM{trackingOrder.totalAmount.toFixed(2)}</p>
              <ol className="relative ml-3 border-l-2 border-border space-y-5 pb-2">
                {TIMELINE_STEPS.map((step, i) => {
                  const active = getActiveStep(trackingOrder.status);
                  const done = i <= active;
                  return (
                    <li key={step} className="pl-5 relative">
                      <span className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${done ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`}>
                        {done && <CheckCircle2 size={10} className="text-primary-foreground" />}
                      </span>
                      <p className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyOrders;
