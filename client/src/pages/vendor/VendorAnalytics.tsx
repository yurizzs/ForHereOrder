import { useState, useEffect } from "react";
import { MainLayout } from "../../components/layouts";
import { Icon } from "../../components/ui/icon";
import { Button } from "../../components/ui";
import { useTheme } from "../../contexts/ThemeContext";
import OrderService from "../../services/OrderService";
import { useDateFormatter } from "../../hooks/useDateFormatter";

const VendorAnalytics = () => {
  const { isDark } = useTheme();
  const { date: formatDate } = useDateFormatter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        // Using settlement as a proxy for basic analytics for now
        const res = await OrderService.getSettlement() as any;
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const content = (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-text">
            Business Insights
          </h1>
          <p className="text-text-muted text-sm">
            Detailed performance breakdown and financial tracking.
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" iconName="FaDownload">
                Export CSV
            </Button>
            <Button variant="primary" size="sm" iconName="FaCalendarDays">
                {formatDate(new Date().toISOString())}
            </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <Icon iconName="FaPesoSign" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Daily Revenue</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-500">
                        ₱{data?.breakdown?.total?.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "0.00"}
                    </div>
                    <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                        <Icon iconName="FaArrowUp" className="text-emerald-500" />
                        <span className="font-bold text-emerald-500">+12%</span> vs yesterday
                    </div>
                </div>

                <div className={`p-6 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <Icon iconName="FaBagShopping" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Total Orders</span>
                    </div>
                    <div className="text-3xl font-black text-blue-500">
                        {data?.breakdown?.total?.count ?? 0}
                    </div>
                    <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                        <Icon iconName="FaArrowUp" className="text-emerald-500" />
                        <span className="font-bold text-emerald-500">+4</span> new orders today
                    </div>
                </div>

                <div className={`p-6 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Icon iconName="FaClock" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Avg. Prep Time</span>
                    </div>
                    <div className="text-3xl font-black text-amber-500">
                        12.5 min
                    </div>
                    <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                        <Icon iconName="FaArrowDown" className="text-emerald-500" />
                        <span className="font-bold text-emerald-500">-2 min</span> faster than average
                    </div>
                </div>
            </div>

            <div className={`p-8 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-8">Hourly Traffic Overview</h3>
                <div className="flex items-end justify-between h-48 gap-2">
                    {[15, 25, 45, 80, 65, 30, 20, 15, 40, 90, 55, 20].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div 
                                className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary relative group" 
                                style={{ height: `${height}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-dark text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {height} orders
                                </div>
                            </div>
                            <span className="text-[10px] text-text-muted font-bold">{7 + i} AM</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`p-8 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Top Performing Dishes</h3>
                    <div className="space-y-4">
                        {[
                            { name: "Pork Sisig", sales: 42, revenue: 9450 },
                            { name: "Chicken Adobo", sales: 35, revenue: 6300 },
                            { name: "Lechon Kawali", sales: 28, revenue: 8120 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-bg-light/50 border border-border-muted">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{item.name}</div>
                                        <div className="text-[10px] text-text-muted uppercase tracking-widest">{item.sales} portions sold</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-success">₱{item.revenue.toLocaleString()}</div>
                                    <div className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                                        <Icon iconName="FaArrowTrendUp" /> 8%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`p-8 rounded-3xl border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Operational Health</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span>Order Fulfillment Rate</span>
                                <span className="text-primary">98%</span>
                            </div>
                            <div className="h-2 w-full bg-bg-light rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '98%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span>Customer Satisfaction</span>
                                <span className="text-emerald-500">4.8/5.0</span>
                            </div>
                            <div className="h-2 w-full bg-bg-light rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span>Inventory Efficiency</span>
                                <span className="text-amber-500">85%</span>
                            </div>
                            <div className="h-2 w-full bg-bg-light rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );

  return <MainLayout content={content} />;
};

export default VendorAnalytics;
