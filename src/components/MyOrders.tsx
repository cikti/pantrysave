import { useState } from "react";
import { Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, RotateCcw, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrders, Order, OrderStatus } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:          { label: "Pending",          color: "bg-amber-100 text-amber-700",   icon: <Clock size={14} /> },
  packing:          { label: "Packing",          color: "bg-blue-100 text-blue-700",     icon: <Box size={14} /> },
  shipped:          { label: "Shipped",          color: "bg-indigo-100 text-indigo-700", icon: <Truck size={14} /> },
  out_for_delivery: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700", icon: <Truck size={14} /> },
  delivered:        { label: "Delivered",         color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={14} /> },
  cancelled:        { label: "Cancelled",         color: "bg-red-100 text-red-700",       icon: <XCircle size={14} /> },
};

const TIMELINE_LABELS = [
  { status: "pending" as OrderStatus, label: "Order Placed" },
  { status: "packing" as OrderStatus, label: "Packed" },
  { status: "shipped" as OrderStatus, label: "Shipped" },
  { status: "out_for_delivery" as OrderStatus, label: "Out for Delivery" },
  { status: "delivered" as OrderStatus, label: "Delivered" },
];

const MyOrders = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const recentOrders = orders.slice(0, 5);

  if (recentOrders.length === 0) return null;

  return (
    <>
      <section className="px-4 md:px-6 mt-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">My Orders</h2>
          <button onClick={() => navigate("/orders")} className="text-xs text-primary font-medium">View All</button>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 snap-x snap-mandatory">
          {recentOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            return (
              <div
                key={order.id}
                className="min-w-[260px] max-w-[300px] snap-center bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground truncate">{order.sellerNames[0]}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{new Date(order.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })} · {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                  <p className="text-sm font-semibold text-foreground">RM{order.totalAmount.toFixed(2)}</p>
                </div>

                <div className="flex gap-2 mt-auto pt-1">
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => setTrackingOrder(order)}>
                      Track <ChevronRight size={14} />
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

      <Dialog open={!!trackingOrder} onOpenChange={() => setTrackingOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Order {trackingOrder?.id}</DialogTitle>
          </DialogHeader>
          {trackingOrder && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-4">{trackingOrder.sellerNames.join(", ")} · RM{trackingOrder.totalAmount.toFixed(2)}</p>
              <ol className="relative ml-3 border-l-2 border-border space-y-5 pb-2">
                {TIMELINE_LABELS.map((step) => {
                  const entry = trackingOrder.timeline.find((t) => t.status === step.status);
                  const done = !!entry;
                  return (
                    <li key={step.status} className="pl-5 relative">
                      <span className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${done ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`}>
                        {done && <CheckCircle2 size={10} className="text-primary-foreground" />}
                      </span>
                      <p className={`text-sm ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      {entry && (
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
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
