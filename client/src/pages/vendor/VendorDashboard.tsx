import { useState, useMemo } from "react";
import { Icon } from "../../components/ui/icon";
import { Button } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { MainLayout } from "../../components/layouts";
import { notify } from "../../util/notify";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table/Table";
import type { Order, OrderStatus } from "../../interfaces/food";

const VendorDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();

  // Mock data for orders
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      order_number: "ORD-001",
      customer_id: 101,
      customer_name: "Juan Dela Cruz",
      total_amount: 450.00,
      status: "New",
      created_at: "2026-05-19",
      updated_at: "2026-05-19",
      items: [
        { id: 1, order_id: 1, food_id: 1, food_name: "Spicy Sizzling Sisig", quantity: 2, price_at_purchase: 225.00 }
      ]
    },
    {
      id: 2,
      order_number: "ORD-002",
      customer_id: 102,
      customer_name: "Maria Santos",
      total_amount: 180.00,
      status: "Preparing",
      created_at: "2026-05-19",
      updated_at: "2026-05-19",
      items: [
        { id: 2, order_id: 2, food_id: 2, food_name: "Pork Adobo Rice Bowl", quantity: 1, price_at_purchase: 180.00 }
      ]
    },
    {
      id: 3,
      order_number: "ORD-003",
      customer_id: 103,
      customer_name: "Anna Reyes",
      total_amount: 360.00,
      status: "Served",
      created_at: "2026-05-19",
      updated_at: "2026-05-19",
      items: [
        { id: 3, order_id: 3, food_id: 3, food_name: "Halo-Halo Supreme", quantity: 3, price_at_purchase: 120.00 }
      ]
    },
    {
      id: 4,
      order_number: "ORD-004",
      customer_id: 104,
      customer_name: "Mark Tan",
      total_amount: 290.00,
      status: "New",
      created_at: "2026-05-19",
      updated_at: "2026-05-19",
      items: [
        { id: 4, order_id: 4, food_id: 4, food_name: "Lechon Kawali", quantity: 1, price_at_purchase: 290.00 }
      ]
    }
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === "New" || o.status === "Preparing").length;
    const Served = orders.filter(o => o.status === "Served").length;
    const total = orders.length;
    const revenue = orders.filter(o => o.status === "Served").reduce((acc, curr) => acc + curr.total_amount, 0);

    return [
      {
        title: "Pending Orders",
        value: pending.toString(),
        iconName: "FaClock" as const,
        color: "text-amber-500 bg-amber-500/10",
        description: "Active in kitchen",
      },
      {
        title: "Served Orders",
        value: Served.toString(),
        iconName: "FaCheckCircle" as const,
        color: "text-emerald-500 bg-emerald-500/10",
        description: "Successfully fulfilled",
      },
      {
        title: "Total Orders",
        value: total.toString(),
        iconName: "FaListUl" as const,
        color: "text-indigo-500 bg-indigo-500/10",
        description: "Daily throughput",
      },
      {
        title: "Total Revenue",
        value: `₱${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        iconName: "FaPesoSign" as const,
        color: "text-sky-500 bg-sky-500/10",
        description: "From Served orders",
      },
    ];
  }, [orders]);

  const handleUpdateStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    notify.success(`Order status updated to ${newStatus}`);
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
            <Button variant="outline" size="sm" iconName="FaChartLine">
              View Analytics
            </Button>
            <Button variant="primary" size="sm" iconName="FaPlus">
              Add Menu Item
            </Button>
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
