import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../../components/layouts";
import { Button, Icon, LoadingSpinner, ToastProvider } from "../../components/ui";
import { InputField } from "../../components/ui/forms";
import { useAuth } from "../../contexts/AuthContext";
import FoodService from "../../services/FoodService";
import OrderService from "../../services/OrderService";
import type { Food, Order } from "../../interfaces";
import { notify } from "../../util/notify";

type CartLine = {
  food: Food;
  quantity: number;
};

const pickupSlots = [
  "09:30 AM - Morning break",
  "11:30 AM - Lunch wave 1",
  "12:15 PM - Lunch wave 2",
  "02:30 PM - Afternoon break",
];

const unwrapList = <T,>(response: any): T[] => {
  const payload = response?.data ?? response;
  const list = payload?.data ?? payload?.items ?? payload;
  return Array.isArray(list) ? list : [];
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Record<number, CartLine>>({});
  const [search, setSearch] = useState("");
  const [pickupSlot, setPickupSlot] = useState(pickupSlots[0]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "digital">("cash");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartLines = Object.values(cart);
  const selectedVendorId = cartLines[0]?.food.vendor_id;
  const total = useMemo(
    () => cartLines.reduce((sum, line) => sum + Number(line.food.price) * line.quantity, 0),
    [cartLines]
  );

  const visibleFoods = useMemo(() => {
    const term = search.trim().toLowerCase();
    return foods.filter((food) => {
      const sameVendor = !selectedVendorId || food.vendor_id === selectedVendorId;
      const matchesSearch =
        !term ||
        food.name.toLowerCase().includes(term) ||
        food.category.toLowerCase().includes(term);

      return sameVendor && matchesSearch;
    });
  }, [foods, search, selectedVendorId]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const [menuResponse, orderResponse] = await Promise.all([
        FoodService.getAll({
          limit: 50,
          filter_status: "available",
          sort_by: "name",
          sort_order: "asc",
        }),
        OrderService.getAll({ limit: 8 }),
      ]);

      setFoods(unwrapList<Food>(menuResponse));
      setOrders(unwrapList<Order>(orderResponse));
    } catch {
      notify.error("Could not load student preorder data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const addToCart = (food: Food) => {
    if (selectedVendorId && selectedVendorId !== food.vendor_id) {
      notify.error("Please finish one stall order before choosing another stall.");
      return;
    }

    setCart((current) => {
      const existing = current[food.id];
      const nextQuantity = (existing?.quantity ?? 0) + 1;

      if (food.track_stock && nextQuantity > food.stock_qty) {
        notify.error("Not enough stock for that item.");
        return current;
      }

      return {
        ...current,
        [food.id]: { food, quantity: nextQuantity },
      };
    });
  };

  const updateQuantity = (foodId: number, change: number) => {
    setCart((current) => {
      const line = current[foodId];
      if (!line) return current;

      const nextQuantity = line.quantity + change;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[foodId];
        return next;
      }

      if (line.food.track_stock && nextQuantity > line.food.stock_qty) {
        notify.error("That would exceed the available stock.");
        return current;
      }

      return {
        ...current,
        [foodId]: { ...line, quantity: nextQuantity },
      };
    });
  };

  const submitPreorder = async () => {
    if (cartLines.length === 0) {
      notify.error("Add at least one item first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await OrderService.createPreorder({
        pickup_slot: pickupSlot,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        items: cartLines.map((line) => ({
          food_id: line.food.id,
          quantity: line.quantity,
        })),
      });

      notify.success("Preorder placed. Track it below.");
      setCart({});
      setNotes("");
      await fetchStudentData();
    } catch (error: any) {
      notify.error(error?.response?.data?.message || "Could not place preorder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Student preorder</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text">
          Hi {user?.name || "Student"}, choose your food before the line builds up.
        </h1>
      </div>

      {isLoading ? (
        <div className="min-h-[420px] flex items-center justify-center">
          <LoadingSpinner text="Loading canteen menu..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
          <section className="space-y-4">
            <div className="bg-bg-light border border-border-muted rounded-lg p-4">
              <InputField
                label="Search menu"
                name="menu_search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search meals, snacks, drinks..."
                iconName="FaMagnifyingGlass"
                fullWidth
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {visibleFoods.length === 0 ? (
                <div className="md:col-span-2 2xl:col-span-3 bg-bg-light border border-border-muted rounded-lg p-8 text-center">
                  <Icon iconName="FaBowlFood" className="text-4xl text-text-muted mx-auto mb-3" />
                  <p className="font-bold text-text">No available menu items found.</p>
                  <p className="text-sm text-text-muted mt-1">Try a different search or clear your current cart.</p>
                </div>
              ) : (
                visibleFoods.map((food) => {
                  const isSoldOut = !food.is_available || (food.track_stock && food.stock_qty <= 0);
                  return (
                    <article key={food.id} className="bg-bg-light border border-border-muted rounded-lg p-4 flex flex-col gap-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {food.image ? (
                            <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                          ) : (
                            <Icon iconName="FaUtensils" className="text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-black text-text leading-tight">{food.name}</h2>
                          <p className="text-xs uppercase font-bold text-text-muted mt-1">{food.category}</p>
                          <p className="font-mono font-black text-primary mt-2">PHP {Number(food.price).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-auto">
                        <span className={`text-xs font-bold ${isSoldOut ? "text-danger" : "text-success"}`}>
                          {food.track_stock ? `${food.stock_qty} left` : "Available"}
                        </span>
                        <Button
                          size="sm"
                          iconName="FaPlus"
                          disabled={isSoldOut}
                          onClick={() => addToCart(food)}
                        >
                          Add
                        </Button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <div className="bg-bg-light border border-border-muted rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-text">Current Cart</h2>
                <span className="text-xs font-bold text-text-muted">{cartLines.length} item types</span>
              </div>

              {cartLines.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-muted">
                  Add food from the menu to start a preorder.
                </div>
              ) : (
                <div className="space-y-3">
                  {cartLines.map((line) => (
                    <div key={line.food.id} className="flex items-center justify-between gap-3 border-b border-border-muted pb-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-text truncate">{line.food.name}</p>
                        <p className="text-xs text-text-muted">PHP {Number(line.food.price).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" iconName="FaMinus" onClick={() => updateQuantity(line.food.id, -1)} />
                        <span className="w-6 text-center font-black">{line.quantity}</span>
                        <Button size="sm" variant="ghost" iconName="FaPlus" onClick={() => updateQuantity(line.food.id, 1)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Pickup time
                  <select
                    value={pickupSlot}
                    onChange={(event) => setPickupSlot(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-border-muted bg-bg-main text-text px-3 py-3 text-sm"
                  >
                    {pickupSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "primary" : "ghost"}
                    iconName="FaMoneyBillWave"
                    onClick={() => setPaymentMethod("cash")}
                  >
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === "digital" ? "primary" : "ghost"}
                    iconName="FaWallet"
                    onClick={() => setPaymentMethod("digital")}
                  >
                    Digital
                  </Button>
                </div>

                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="No onions, extra sauce, pickup note..."
                    className="mt-2 w-full rounded-lg border border-border-muted bg-bg-main text-text px-3 py-3 text-sm resize-none"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between border-t border-border-muted pt-4">
                <span className="font-bold text-text">Total</span>
                <span className="font-mono text-xl font-black text-primary">PHP {total.toFixed(2)}</span>
              </div>

              <Button fullWidth iconName="FaReceipt" isLoading={isSubmitting} onClick={submitPreorder}>
                Place Preorder
              </Button>
            </div>

            <div className="bg-bg-light border border-border-muted rounded-lg p-4 space-y-3">
              <h2 className="text-lg font-black text-text">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-sm text-text-muted">Your preorder history will appear here.</p>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-border-muted rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-sm text-text">{order.order_number}</p>
                      <span className="text-[10px] uppercase font-black px-2 py-1 rounded bg-primary/10 text-primary">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-2">{order.pickup_slot}</p>
                    <p className="font-mono font-bold text-sm text-text mt-1">PHP {Number(order.total_amount).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      <ToastProvider />
    </div>
  );

  return <MainLayout content={content} />;
};

export default StudentDashboard;
