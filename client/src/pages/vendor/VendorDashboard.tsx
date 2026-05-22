import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/icon";
import { Button } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MainLayout } from "../../components/layouts";
import { notify } from "../../util/notify";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table/Table";
import type { Order, OrderStatus } from "../../interfaces";
import OrderService from "../../services/OrderService";
import { useDateFormatter } from "../../hooks/useDateFormatter";
import { PATHS } from "../../routes/path";

const VendorDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { date: formatDate } = useDateFormatter();
  const navigate = useNavigate();

  const [settlement, setSettlement] = useState<{
    cash: { count: number; amount: number };
    total: { count: number; amount: number };
  } | null>(null);

  const [isSettlementLoading, setIsSettlementLoading] = useState(true);

  const fetchSettlement = async () => {
    try {
      setIsSettlementLoading(true);
      const res = await OrderService.getSettlement() as any;
      setSettlement(res.data.breakdown);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettlementLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await OrderService.getAll({ limit: 50 }) as any;
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
      notify.error("Failed to sync live orders from kitchen queue.");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchSettlement();
    fetchOrders();

    // Auto-refresh every 30 seconds for live ticker feel
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Core Ticker Logic: Group Active Orders by Pickup Slot
  const groupedOrders = useMemo(() => {
    const active = orders.filter(o => 
      o.status === "New" || o.status === "Preparing" || o.status === "Ready"
    );

    const groups: Record<string, Order[]> = {};
    
    active.forEach(order => {
      const slot = order.pickup_slot || "ASAP / No Slot";
      if (!groups[slot]) groups[slot] = [];
      groups[slot].push(order);
    });

    return groups;
  }, [orders]);

  // Statistics calculation
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === "New" || o.status === "Preparing").length;
    const servedCount = orders.filter(o => o.status === "Served").length;
    const total = orders.length;
    const revenue = orders.filter(o => o.status === "Served").reduce((acc, curr) => acc + curr.total_amount, 0);

    return [
      {
        title: "Active Queue",
        value: pending.toString(),
        iconName: "FaClock" as const,
        color: "text-amber-500 bg-amber-500/10",
        description: "Orders being prepped",
      },
      {
        title: "Served Today",
        value: servedCount.toString(),
        iconName: "FaCheckCircle" as const,
        color: "text-emerald-500 bg-emerald-500/10",
        description: "Successfully fulfilled",
      },
      {
        title: "Daily Volume",
        value: total.toString(),
        iconName: "FaListUl" as const,
        color: "text-indigo-500 bg-indigo-500/10",
        description: "Total orders processed",
      },
      {
        title: "Cash Settlement",
        value: `₱${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        iconName: "FaPesoSign" as const,
        color: "text-sky-500 bg-sky-500/10",
        description: "From Served orders",
      },
    ];
  }, [orders]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, newStatus);
      notify.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      fetchSettlement();
    } catch (err) {
      notify.error("Could not update order status.");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Served": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Preparing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "New": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Ready": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Cancelled": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const content = (
    <div className={`p-4 min-h-screen transition-colors duration-200 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
              Vendor Dashboard
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Welcome back{user?.name ? `, ${user.name}` : ""}! Monitor your kitchen activity and order statistics.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              iconName="FaChartLine"
              onClick={() => navigate(PATHS.APP.VENDOR_ANALYTICS)}
            >
              View Analytics
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              iconName="FaPlus"
              onClick={() => navigate(PATHS.APP.FOOD_CATALOG)}
            >
              Add Menu Item
            </Button>
          </div>
        </div>

        {/* Settlement Report Section */}
        <div className="mb-8">
          <div className={`p-6 rounded-3xl border shadow-sm ${isDark ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200"}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Icon iconName="FaCalculator" className="text-2xl" />
                </div>
                <div>
                  <h2 className={`text-lg font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                    Canteen Settlement Report
                  </h2>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Closing summary for {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                {/* Cash Breakdown */}
                <div className={`flex-1 md:flex-none min-w-[200px] p-5 rounded-2xl border ${isDark ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Cash on Pickup</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      ₱{settlement?.cash.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "0.00"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">({settlement?.cash.count ?? 0} orders)</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex-1 md:flex-none min-w-[200px] p-5 rounded-2xl bg-primary text-bg-dark shadow-lg shadow-primary/20">
                  <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Total Settlement</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">
                      ₱{settlement?.total.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "0.00"}
                    </span>
                    <span className="text-[10px] font-bold opacity-70">({settlement?.total.count ?? 0} total)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon iconName="FaList" className="text-lg" />
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  {stat.value}
                </span>
                <span className={`text-[10px] mt-1 font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {stat.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Core Order Ticker: Active Kitchen Queue */}
        <div className="mb-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full animate-pulse" />
              <h2 className={`text-xl font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                Live Kitchen Ticker
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Live Monitoring Active
            </span>
          </div>

          {Object.keys(groupedOrders).length === 0 ? (
            <div className={`p-12 rounded-3xl border border-dashed text-center flex flex-col items-center gap-4 ${isDark ? "border-slate-700 bg-slate-800/20" : "border-slate-200 bg-slate-50"}`}>
               <Icon iconName="FaKitchenSet" className="text-4xl text-slate-300" />
               <p className="text-sm text-slate-500 font-medium">No active orders in the queue. Take a breather!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(groupedOrders).map(([slot, items]) => (
                <div 
                  key={slot} 
                  className={`flex flex-col rounded-3xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
                    isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="bg-primary px-5 py-3 flex justify-between items-center">
                    <span className="text-bg-dark font-black uppercase italic tracking-tighter text-sm">
                      {slot}
                    </span>
                    <span className="bg-bg-dark text-primary text-[10px] px-2 py-0.5 rounded-full font-black">
                      {items.length} ORDERS
                    </span>
                  </div>
                  
                  <div className="p-4 space-y-3 flex-1">
                    {items.map(order => (
                      <div 
                        key={order.id} 
                        className={`p-4 rounded-2xl border group transition-colors ${
                          isDark ? "bg-slate-900/40 border-slate-700 hover:border-primary/50" : "bg-slate-50 border-slate-100 hover:border-primary/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500">#{order.order_number}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="font-bold text-sm mb-3 text-text capitalize">
                          {order.customer_name}
                        </div>

                        <div className="space-y-1.5 mb-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span className="text-text-muted">{item.quantity}x {item.food_name}</span>
                              <span className="font-mono text-[10px] font-bold">₱{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-border-muted/30">
                          {order.status === "New" && (
                            <Button 
                              variant="primary" 
                              className="flex-1 py-1.5 text-[10px]" 
                              onClick={() => handleUpdateStatus(order.id, "Preparing")}
                            >
                              START COOKING
                            </Button>
                          )}
                          {order.status === "Preparing" && (
                            <Button 
                              variant="secondary" 
                              className="flex-1 py-1.5 text-[10px]" 
                              onClick={() => handleUpdateStatus(order.id, "Ready")}
                            >
                              MARK AS READY
                            </Button>
                          )}
                           {order.status === "Ready" && (
                            <Button 
                              variant="primary" 
                              className="flex-1 py-1.5 text-[10px] bg-emerald-500 hover:bg-emerald-600 border-none text-white" 
                              onClick={() => handleUpdateStatus(order.id, "Served")}
                            >
                              HAND OVER
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className={`font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
              Incoming Orders
            </h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Order ID</TableCell>
                <TableCell isHeader>Customer</TableCell>
                <TableCell isHeader>Pickup Slot</TableCell>
                <TableCell isHeader>Items</TableCell>
                <TableCell isHeader>Total</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader align="right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-bold">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <span className="text-xs font-black uppercase italic text-primary">
                      {order.pickup_slot || "ASAP"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="text-xs">
                          {item.quantity}x {item.food_name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">₱{order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex justify-end gap-2">
                      {order.status === "New" && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(order.id, "Preparing")}
                        >
                          Accept
                        </Button>
                      )}
                      {order.status === "Preparing" && (
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(order.id, "Served")}
                        >
                          Done
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" iconName="FaEllipsisVertical" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12 text-slate-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Recommendations Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-indigo-50/50 border-indigo-100"}`}>
            <h3 className="font-bold text-indigo-500 mb-2 flex items-center gap-2">
              <Icon iconName="FaLightbulb" /> Pro Tip: Analytics
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We recommend adding a dedicated <strong>Revenue & Statistics</strong> page. 
              This would allow you to view daily, weekly, and monthly growth trends with interactive charts.
            </p>
          </div>
          <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-emerald-50/50 border-emerald-100"}`}>
            <h3 className="font-bold text-emerald-500 mb-2 flex items-center gap-2">
              <Icon iconName="FaKitchenSet" /> Kitchen Efficiency
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Consider adding an <strong>"Estimated Time"</strong> feature for customers. 
              When you accept an order, you can notify them how long their food will take.
            </p>
          </div>
        </div>
      </div>
  );

  return <MainLayout content={content} />;
};

export default VendorDashboard;
