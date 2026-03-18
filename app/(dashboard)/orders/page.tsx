"use client";

import { useState } from "react";
import {
    ClipboardList,
    Eye,
    RefreshCw,
    Search,
    X,
    Printer,
} from "lucide-react";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { ordersApi, settingsApi } from "@/lib/api/apis";
import { useEffect } from "react";
import { Loader2, Coffee } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
    completed: "bg-emerald-400/10 text-emerald-400",
    pending: "bg-amber-400/10 text-amber-400",
    cancelled: "bg-red-400/10 text-red-400",
    refunded: "bg-blue-400/10 text-blue-400",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    paid: "bg-emerald-400/20 text-emerald-400",
    partial: "bg-amber-400/20 text-amber-400",
    unpaid: "bg-red-400/20 text-red-400",
    refunded: "bg-blue-400/20 text-blue-400",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: "💵 Cash",
    card: "💳 Card",
    qr: "📱 QR",
    split: "✂️ Split",
    loyalty: "🪙 Loyalty",
    storeCredit: "💶 Credit",
};

export default function OrdersPage() {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, summaryData, settingsData] = await Promise.all([
                ordersApi.getAll(),
                ordersApi.getSummary(),
                settingsApi.get()
            ]);
            setOrders(ordersData || []);
            setSummary(summaryData);
            setSettings(settingsData);
        } catch (err) {
            console.error("Failed to load orders data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const teaCupsSold = orders.filter(o => o.status === "completed").reduce((sum, order) => {
        const teaItems = order.items.filter(i => 
            i.product.id === "quick-tea" || 
            i.product.id === "tea-full" || 
            i.product.id === "tea-half" ||
            i.product.name.toLowerCase().includes("tea")
        );
        return sum + teaItems.reduce((s, i) => s + (i.quantity || 0), 0);
    }, 0);

    const filtered = orders.filter((o) => {
        const matchStatus = filterStatus === "all" || o.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer?.name?.toLowerCase().includes(q) ||
            o.cashier.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.total, 0);

    const handleRefund = async (orderId: string) => {
        if (confirm("Are you sure you want to refund this order?")) {
            try {
                await ordersApi.update(orderId, { status: "refunded" });
                loadData();
                setSelectedOrder(null);
            } catch (err) {
                alert("Failed to refund order.");
            }
        }
    };

    const handlePrint = (order: Order) => {
        window.print(); // Simple for now
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            {/* Stats */}
            <div className={cn(
                "grid grid-cols-2 gap-3 md:gap-4",
                settings?.store?.parlour ? "lg:grid-cols-5" : "lg:grid-cols-4"
            )}>
                {[
                    { label: "Total Revenue", value: formatCurrency(summary?.totalSales || 0), color: "text-primary" },
                    { label: "Total Paid", value: formatCurrency(summary?.totalPaid || 0), color: "text-emerald-400" },
                    { label: "Total Credit (Due)", value: formatCurrency(summary?.totalDue || 0), color: "text-amber-400" },
                    { label: "Total Orders", value: summary?.orderCount || 0, color: "text-blue-400" },
                    ...(settings?.store?.parlour ? [
                        { label: "Tea Cups", value: `${teaCupsSold} Cups`, color: "text-emerald-500", icon: Coffee }
                    ] : [])
                ].map((s: any) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                            {s.icon && <s.icon className="w-3 h-3 text-muted-foreground" />}
                            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                        </div>
                        <p className={`text-lg md:text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 focus-within:border-primary transition-all">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search orders..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                    />
                    {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {["all", "completed", "pending", "refunded", "cancelled"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={cn(
                                "px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap flex-shrink-0",
                                filterStatus === s
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile: Card list | Desktop: Table */}
            <div className="md:hidden space-y-3">
                {filtered.map((order) => (
                    <div
                        key={order.id}
                        className="bg-card border border-border rounded-xl p-4 space-y-3"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_STYLES[order.status])}>
                                    {order.status}
                                </span>
                                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase", PAYMENT_STATUS_STYLES[order.paymentStatus])}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                {order.customer?.avatar ?? "G"}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-foreground">{order.customer?.name ?? "Walk-in"}</p>
                                <p className="text-xs text-muted-foreground">{order.items.length} items • {PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                            </div>
                            <p className="ml-auto text-sm font-bold text-foreground">{formatCurrency(order.total)}</p>
                        </div>
                        <div className="flex gap-2 pt-1 border-t border-border">
                            <button
                                onClick={() => setSelectedOrder(order)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                                onClick={() => handlePrint(order)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print
                            </button>
                            {order.status === "completed" && (
                                <button
                                    onClick={() => handleRefund(order.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Refund
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Order #", "Customer", "Items", "Payment", "Total", "Status", "Date", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-mono font-medium text-foreground">{order.orderNumber}</p>
                                        <p className="text-xs text-muted-foreground">{order.cashier}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                                                {order.customer?.avatar ?? "G"}
                                            </div>
                                            <div>
                                                <p className="text-sm text-foreground">{order.customer?.name ?? "Walk-in"}</p>
                                                <p className="text-xs text-muted-foreground">{order.customer?.email ?? "—"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-foreground">{order.items.length} items</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                            {order.items.map(i => i.product.name).join(", ")}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-foreground">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-bold text-foreground">{formatCurrency(order.total)}</p>
                                        {order.discount > 0 && (
                                            <p className="text-xs text-emerald-400">-{formatCurrency(order.discount)}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={cn("inline-block text-[10px] w-fit px-2 py-0.5 rounded-full font-medium capitalize", STATUS_STYLES[order.status])}>
                                                {order.status}
                                            </span>
                                            <span className={cn("inline-block text-[10px] w-fit px-2 py-0.5 rounded font-bold uppercase tracking-tight", PAYMENT_STATUS_STYLES[order.paymentStatus])}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(order.createdAt)}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePrint(order)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            {order.status === "completed" && (
                                                <button
                                                    onClick={() => handleRefund(order.id)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground">No orders found</p>
                    </div>
                )}
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                    Showing {filtered.length} of {orders.length} orders
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="md:hidden py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium text-foreground">No orders found</p>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onRefund={() => handleRefund(selectedOrder.id)}
                    onPrint={() => handlePrint(selectedOrder)}
                />
            )}
        </div>
    );
}

function OrderDetailModal({ order, onClose, onRefund, onPrint }: { order: Order; onClose: () => void; onRefund: () => void; onPrint: () => void }) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl animate-slide-in sm:animate-fade-in overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h2 className="font-bold text-foreground">{order.orderNumber}</h2>
                        <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium capitalize", STATUS_STYLES[order.status])}>
                            {order.status}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    {order.customer && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                {order.customer.avatar}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{order.customer.name}</p>
                                <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">Order Items</h3>
                        <div className="space-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                                        {item.product.image?.startsWith('http') ? (
                                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-2xl">{item.product.image || "📦"}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)} × {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">{formatCurrency(item.product.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-border">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm text-emerald-400">
                                <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Tax</span><span>{formatCurrency(order.tax)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                            <span>Total</span><span className="text-primary">{formatCurrency(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-400">
                            <span>Amount Paid</span><span>{formatCurrency(order.amountPaid)}</span>
                        </div>
                        {order.amountDue > 0 && (
                            <div className="flex justify-between text-sm text-red-400 font-semibold">
                                <span>Amount Due (Credit)</span><span>{formatCurrency(order.amountDue)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={onPrint}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <Printer className="w-4 h-4" /> Print Receipt
                        </button>
                        {order.status === "completed" && (
                            <button
                                onClick={onRefund}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 text-sm transition-colors">
                                <RefreshCw className="w-4 h-4" /> Refund
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
