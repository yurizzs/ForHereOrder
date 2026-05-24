import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../../components/layouts";
import { Button, Icon, LoadingSpinner, ToastProvider } from "../../components/ui";
import { InputField } from "../../components/ui/forms";
import OrderService from "../../services/OrderService";
import type { Order, OrderStatus } from "../../interfaces";
import { notify } from "../../util/notify";

type StatusFilter = "All" | OrderStatus;

const statusFilters: StatusFilter[] = ["All", "New", "Preparing", "Ready", "Served", "Cancelled"];

const statusStyles: Record<OrderStatus, string> = {
  New: "bg-info/10 text-info border-info/20",
  Preparing: "bg-warning/10 text-warning border-warning/20",
  Ready: "bg-success/10 text-success border-success/20",
  Served: "bg-primary/10 text-primary border-primary/20",
  Cancelled: "bg-danger/10 text-danger border-danger/20",
};

const unwrapOrders = (response: any): Order[] => {
  const payload = response?.data ?? response;
  const list = payload?.data ?? payload?.items ?? payload;
  return Array.isArray(list) ? list : [];
};

const StudentOrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await OrderService.getAll({
        limit: 50,
        status: status === "All" ? undefined : status,
      });
      setOrders(unwrapOrders(response));
    } catch {
      notify.error("Could not load order history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [status]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;

    return orders.filter((order) => {
      const itemNames = order.items?.map((item) => item.food_name).join(" ") ?? "";
      return `${order.order_number} ${order.pickup_slot ?? ""} ${itemNames}`
        .toLowerCase()
        .includes(term);
    });
  }, [orders, search]);

  const totalSpent = useMemo(
    () =>
      orders
        .filter((order) => order.status !== "Cancelled")
        .reduce((sum, order) => sum + Number(order.total_amount), 0),
    [orders]
  );

  const activeOrders = orders.filter((order) => ["New", "Preparing", "Ready"].includes(order.status)).length;

  const cancelOrder = async (order: Order) => {
    try {
      await OrderService.cancelOrder(order.id);
      notify.success("Order cancelled.");
      await loadOrders();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || "Could not cancel order.");
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Order history</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text">
            Track every preorder from request to pickup.
          </h1>
        </div>
        <Button iconName="FaRotate" variant="ghost" onClick={loadOrders}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-light border border-border-muted rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total orders</p>
          <p className="text-2xl font-black text-text mt-2">{orders.length}</p>
        </div>
        <div className="bg-bg-light border border-border-muted rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Active now</p>
          <p className="text-2xl font-black text-primary mt-2">{activeOrders}</p>
        </div>
        <div className="bg-bg-light border border-border-muted rounded-lg p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Completed spend</p>
          <p className="text-2xl font-black text-success mt-2">PHP {totalSpent.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-bg-light border border-border-muted rounded-lg p-4 space-y-4">
        <InputField
          label="Find order"
          name="order_search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order number, pickup time, or item..."
          iconName="FaMagnifyingGlass"
          fullWidth
        />

        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={status === filter ? "primary" : "ghost"}
              onClick={() => setStatus(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[360px] flex items-center justify-center">
          <LoadingSpinner text="Loading order history..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-bg-light border border-border-muted rounded-lg p-10 text-center">
          <Icon iconName="FaReceipt" className="text-5xl text-text-muted mx-auto mb-4" />
          <p className="font-black text-text">No orders found.</p>
          <p className="text-sm text-text-muted mt-1">Your matching preorder records will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article key={order.id} className="bg-bg-light border border-border-muted rounded-lg p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-text">{order.order_number}</h2>
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded border ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mt-2">
                    {order.pickup_slot || "No pickup slot"} • {order.payment_method}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{order.created_at}</p>
                </div>
                <p className="font-mono text-xl font-black text-primary">
                  PHP {Number(order.total_amount).toFixed(2)}
                </p>
              </div>

              {["New", "Preparing"].includes(order.status) && (
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="danger"
                    iconName="FaBan"
                    onClick={() => cancelOrder(order)}
                  >
                    Cancel Order
                  </Button>
                </div>
              )}

              <div className="mt-4 divide-y divide-border-muted border-y border-border-muted">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-text">{item.food_name}</p>
                      <p className="text-xs text-text-muted">
                        {item.quantity} x PHP {Number(item.price_at_purchase).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-mono font-bold text-sm text-text">
                      PHP {Number(item.subtotal ?? item.quantity * item.price_at_purchase).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mt-4 rounded-lg bg-bg-main border border-border-muted p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Notes</p>
                  <p className="text-sm text-text mt-1">{order.notes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default StudentOrderHistory;
