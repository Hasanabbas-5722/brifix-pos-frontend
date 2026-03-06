"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { SALES_DATA, MONTHLY_REVENUE, TOP_PRODUCTS } from "@/lib/data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
    Calendar,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Users,
} from "lucide-react";

const PIE_COLORS = ["#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899", "#10b981", "#ef4444"];

const CATEGORY_SALES = [
    { name: "Beverages", value: 35, revenue: 22050 },
    { name: "Food", value: 28, revenue: 17640 },
    { name: "Electronics", value: 18, revenue: 11340 },
    { name: "Accessories", value: 10, revenue: 6300 },
    { name: "Clothing", value: 6, revenue: 3780 },
    { name: "Other", value: 3, revenue: 1890 },
];

const TIME_RANGES = ["7D", "30D", "3M", "6M", "1Y"];

const SUMMARY_STATS = [
    { label: "Total Revenue", value: formatCurrency(62900), change: "+18.2%", up: true, icon: DollarSign },
    { label: "Total Orders", value: "2,847", change: "+12.5%", up: true, icon: ShoppingBag },
    { label: "Avg Order Value", value: formatCurrency(22.1), change: "+4.8%", up: true, icon: TrendingUp },
    { label: "New Customers", value: "342", change: "-2.1%", up: false, icon: Users },
];

export default function ReportsPage() {
    const [timeRange, setTimeRange] = useState("30D");
    const last30 = SALES_DATA.slice(-30);
    const last7 = SALES_DATA.slice(-7);
    const displayData = timeRange === "7D" ? last7 : last30;

    const totalRevenue = displayData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = displayData.reduce((s, d) => s + d.orders, 0);
    const avgOrderValue = totalRevenue / displayData.reduce((s, d) => s + d.orders, 0);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sales Analytics</span>
                </div>
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                    {TIME_RANGES.map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                timeRange === r
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {SUMMARY_STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Icon className="w-4 h-4 text-primary" />
                                </div>
                                <span className={`flex items-center gap-0.5 text-xs font-medium ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                                    {s.up ? "↑" : "↓"} {s.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-semibold text-foreground">Revenue Trend</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Total: {formatCurrency(totalRevenue)} • {totalOrders} orders
                        </p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={displayData}>
                        <defs>
                            <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="reportOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="revenue"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="orders"
                            orientation="right"
                            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                fontSize: "11px",
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(value: any, name: any) =>
                                name === "revenue" ? [formatCurrency(value), "Revenue"] : [value, "Orders"]
                            }
                            labelFormatter={(label) => formatDate(label)}
                        />
                        <Area
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(262.1, 83.3%, 57.8%)"
                            strokeWidth={2}
                            fill="url(#reportRevenue)"
                        />
                        <Area
                            yAxisId="orders"
                            type="monotone"
                            dataKey="orders"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#reportOrders)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-6 mt-2 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-primary rounded" />
                        <span className="text-xs text-muted-foreground">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-blue-400 rounded" />
                        <span className="text-xs text-muted-foreground">Orders</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monthly Revenue */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-5">Monthly Revenue (Last 7 Months)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={MONTHLY_REVENUE}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(v: any) => [formatCurrency(v), "Revenue"]}
                            />
                            <Bar dataKey="revenue" fill="hsl(262.1, 83.3%, 57.8%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Breakdown */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-4">Category Breakdown</h3>
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width={140} height={140}>
                            <PieChart>
                                <Pie
                                    data={CATEGORY_SALES}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={42}
                                    outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {CATEGORY_SALES.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "11px",
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(v: any) => [`${v}%`, "Share"]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                            {CATEGORY_SALES.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                                    <span className="flex-1 text-muted-foreground">{item.name}</span>
                                    <span className="font-medium text-foreground">{item.value}%</span>
                                    <span className="text-muted-foreground/60">{formatCurrency(item.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-foreground">Top Selling Products</h3>
                    <span className="text-xs text-muted-foreground">This month</span>
                </div>
                <div className="space-y-3">
                    {TOP_PRODUCTS.map((p, i) => {
                        const maxRev = TOP_PRODUCTS[0].revenue;
                        return (
                            <div key={p.name} className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground w-5 text-right">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-foreground">{p.name}</span>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>{p.units.toLocaleString()} units</span>
                                            <span className="font-semibold text-foreground">{formatCurrency(p.revenue)}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(p.revenue / maxRev) * 100}%`,
                                                background: `linear-gradient(90deg, hsl(262.1, 83.3%, 57.8%), #a855f7)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
