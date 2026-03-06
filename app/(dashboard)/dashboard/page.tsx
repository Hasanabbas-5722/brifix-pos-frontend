"use client";

import {
    ArrowUpRight,
    CreditCard,
    DollarSign,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    Users,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
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
import { SALES_DATA, TOP_PRODUCTS, MONTHLY_REVENUE, PRODUCTS, ORDERS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const stats = [
    {
        title: "Today's Revenue",
        value: "$1,840.50",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        desc: "vs yesterday $1,635.80",
    },
    {
        title: "Orders Today",
        value: "73",
        change: "+8.2%",
        trend: "up",
        icon: ShoppingBag,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        desc: "vs yesterday 67 orders",
    },
    {
        title: "New Customers",
        value: "12",
        change: "-3.1%",
        trend: "down",
        icon: Users,
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        desc: "vs yesterday 13 customers",
    },
    {
        title: "Avg Order Value",
        value: "$25.21",
        change: "+2.4%",
        trend: "up",
        icon: CreditCard,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        desc: "vs yesterday $24.62",
    },
];

const PIE_COLORS = ["#8b5cf6", "#f59e0b", "#3b82f6", "#ec4899", "#10b981", "#ef4444"];

const categoryData = [
    { name: "Beverages", value: 35 },
    { name: "Food", value: 28 },
    { name: "Electronics", value: 18 },
    { name: "Accessories", value: 10 },
    { name: "Clothing", value: 6 },
    { name: "Other", value: 3 },
];

const lowStockProducts = PRODUCTS.filter((p) => p.stock <= p.minStock && p.stock > 0);
const outOfStockProducts = PRODUCTS.filter((p) => p.stock === 0);

export default function DashboardPage() {
    const recentOrders = ORDERS.slice(0, 5);
    const weekData = SALES_DATA.slice(-7);

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in">
            {/* Alert Banner */}
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">
                        <span className="font-semibold">
                            {outOfStockProducts.length} out of stock
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold">
                            {lowStockProducts.length} low stock
                        </span>{" "}
                        products need attention.{" "}
                        <Link href="/inventory" className="underline hover:no-underline font-medium ml-1">
                            View Inventory →
                        </Link>
                    </p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <span
                                    className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                                        }`}
                                >
                                    {stat.trend === "up" ? (
                                        <TrendingUp className="w-3 h-3" />
                                    ) : (
                                        <TrendingDown className="w-3 h-3" />
                                    )}
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{stat.desc}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-foreground">Revenue Overview</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days performance</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-muted-foreground">Revenue</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weekData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(262.1, 83.3%, 57.8%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short" })}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                                tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    color: "hsl(var(--foreground))",
                                    fontSize: "12px",
                                }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                                labelFormatter={(label) => formatDate(label)}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(262.1, 83.3%, 57.8%)"
                                strokeWidth={2}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Pie */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="mb-6">
                        <h3 className="font-semibold text-foreground">Sales by Category</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Today's distribution</p>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {categoryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                    color: "hsl(var(--foreground))",
                                    fontSize: "12px",
                                }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(v: any) => [`${v}%`, "Share"]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {categoryData.slice(0, 4).map((item, i) => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: PIE_COLORS[i] }}
                                />
                                <span className="text-muted-foreground flex-1">{item.name}</span>
                                <span className="font-medium text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Orders */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-semibold text-foreground">Recent Orders</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
                        </div>
                        <Link
                            href="/orders"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                    {order.customer?.avatar ?? "G"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {order.customer?.name ?? "Walk-in Customer"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">
                                        {formatCurrency(order.total)}
                                    </p>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "completed"
                                            ? "bg-emerald-400/10 text-emerald-400"
                                            : order.status === "refunded"
                                                ? "bg-red-400/10 text-red-400"
                                                : "bg-amber-400/10 text-amber-400"
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="font-semibold text-foreground">Top Products</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Best sellers this month</p>
                        </div>
                        <Link
                            href="/products"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {TOP_PRODUCTS.slice(0, 5).map((product, index) => {
                            const maxRevenue = TOP_PRODUCTS[0].revenue;
                            const pct = (product.revenue / maxRevenue) * 100;
                            return (
                                <div key={product.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-4">{index + 1}.</span>
                                            <span className="font-medium text-foreground">{product.name}</span>
                                        </div>
                                        <span className="text-muted-foreground">{formatCurrency(product.revenue)}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: `linear-gradient(90deg, hsl(262.1, 83.3%, 57.8%), #a855f7)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-semibold text-foreground">Monthly Revenue</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Last 7 months performance</p>
                    </div>
                    <Link href="/reports" className="flex items-center gap-1 text-xs text-primary hover:underline">
                        Full Report <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={MONTHLY_REVENUE}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--foreground))",
                                fontSize: "12px",
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(v: any) => [formatCurrency(v), "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="hsl(262.1, 83.3%, 57.8%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
