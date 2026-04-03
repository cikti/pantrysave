import { useState } from "react";
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock, ChevronRight, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrders, Order, OrderStatus } from "@/contexts/OrderContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending:          { label: "Pending",          icon: <Clock size={14} />,        className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  packing:          { label: "Packing",          icon: <Box size={14} />,          className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped:          { label: "Shipped",          icon: <Truck size={14} />,        className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  out_for_delivery: { label: "Out for Delivery", icon: <Truck size={14} />,        className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  delivered:        { label: "Delivered",         icon: <CheckCircle2 size={14} />, className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled:        { label: "Cancelled",         icon: <XCircle size={14} />,      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const TIMELINE_LABELS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "packing", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const MyOrdersPage = () => {
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const filters: { key: "all" | OrderStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "packing", label: "Packing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
  ];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Orders</h1>
          <span className="ml-auto text-xs text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap text-xs font-medium px-3.5 py-1.5 rounded-full transition-all ${
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4 text-center px-6">
            <Package size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No orders found</p>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {filtered.map((order, idx) => {
              const cfg = STATUS_CONFIG[order.status];
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.sellerNames.join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.createdAt)}</p>

                  <div className="mt-2 space-y-1">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-foreground truncate flex-1">{item.quantity}x {item.name}</span>
                        <span className="text-muted-foreground ml-2">RM{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground italic">+{order.items.length - 3} more items</p>
                    )}
                  </div>

                  <div className="border-t border-border mt-3 pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{order.deliveryMethod} · {order.paymentMethod}</p>
                      <p className="text-sm font-bold text-primary">RM{order.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setTrackingOrder(order)}>
                          Track <ChevronRight size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tracking Timeline Modal */}
        <Dialog open={!!trackingOrder} onOpenChange={() => setTrackingOrder(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Order {trackingOrder?.id}</DialogTitle>
            </DialogHeader>
            {trackingOrder && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground mb-4">
                  {trackingOrder.sellerNames.join(", ")} · RM{trackingOrder.totalAmount.toFixed(2)}
                </p>
                <ol className="relative ml-3 border-l-2 border-border space-y-5 pb-2">
                  {TIMELINE_LABELS.map((step) => {
                    const entry = trackingOrder.timeline.find((t) => t.status === step.status);
                    const done = !!entry;
                    return (
                      <li key={step.status} className="pl-5 relative">
                        <span className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          done ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"
                        }`}>
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
                  {trackingOrder.status === "cancelled" && (
                    <li className="pl-5 relative">
                      <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 bg-destructive border-destructive flex items-center justify-center">
                        <XCircle size={10} className="text-destructive-foreground" />
                      </span>
                      <p className="text-sm font-medium text-destructive">Cancelled</p>
                    </li>
                  )}
                </ol>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default MyOrdersPage;
