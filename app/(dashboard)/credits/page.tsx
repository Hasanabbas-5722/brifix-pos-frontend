"use client";

import { useState, useEffect } from "react";
import {
    Wallet,
    Users,
    Search,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    Eye,
    X,
    Loader2,
    Calendar,
    CircleDollarSign,
    Package,
    ArrowLeft
} from "lucide-react";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import { creditsApi, settingsApi } from "@/lib/api/apis";

export default function CreditsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [customerSummary, setCustomerSummary] = useState<any[]>([]);
    const [globalSummary, setGlobalSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerBills, setCustomerBills] = useState<any[]>([]);
    const [isLoadingBills, setIsLoadingBills] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [settingsData, custSummary, globSummary] = await Promise.all([
                    settingsApi.get(),
                    creditsApi.getCustomerSummary(),
                    creditsApi.getSummary()
                ]);
                setSettings(settingsData);
                setCustomerSummary(custSummary);
                setGlobalSummary(globSummary);
            } catch (err) {
                console.error("Failed to fetch credit data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchBills = async (customerId: string) => {
        setIsLoadingBills(true);
        try {
            const bills = await creditsApi.getCustomerBills(customerId);
            setCustomerBills(bills);
        } catch (err) {
            console.error("Failed to fetch customer bills", err);
        } finally {
            setIsLoadingBills(false);
        }
    };

    const handleSelectCustomer = (customer: any) => {
        setSelectedCustomer(customer);
        fetchBills(customer.customerId);
    };

    const filteredCustomers = customerSummary.filter(c => 
        c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        c.customerEmail?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings?.payment?.credit_system) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <CircleDollarSign className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Credit System Disabled</h2>
                <p className="text-muted-foreground max-w-sm mt-2">
                    Advanced credit tracking is currently disabled. Enable it in the <strong>Settings &gt; Payment</strong> tab to start managing customer dues.
                </p>
                <button 
                    onClick={() => window.location.href = '/settings'}
                    className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                    Go to Settings
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-20">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Credit Management</h1>
                    <p className="text-sm text-muted-foreground">Track customer outstanding balances and partial payments</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Total Pending Credit</p>
                    </div>
                    <p className="text-3xl font-bold text-amber-400">{formatCurrency(globalSummary?.totalCredit || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Outstanding from {customerSummary.length} customers</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Total Payments Received</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency(globalSummary?.totalPaid || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-2">Against {globalSummary?.totalOrders || 0} total orders</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Active Debtors</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{customerSummary.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Customers with unpaid balances</p>
                </div>
            </div>

            {/* Customers List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Customer Wise Dues
                    </h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search debtors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Billed</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Amount</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credit Pending</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCustomers.length > 0 ? filteredCustomers.map((c) => (
                                <tr key={c.customerId} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                {c.customerName?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{c.customerName || "Unknown"}</p>
                                                <p className="text-xs text-muted-foreground">{c.customerEmail || "No email"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-foreground font-medium">{formatCurrency(c.totalAmount)}</p>
                                        <p className="text-[10px] text-muted-foreground">{c.orderCount} Orders</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-emerald-400 font-bold">{formatCurrency(c.totalPaid)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-red-400 font-bold">{formatCurrency(c.totalDue)}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleSelectCustomer(c)}
                                            className="px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1.5 ml-auto"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View Bills
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center">
                                            <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
                                            <p className="text-muted-foreground font-medium">No debtors found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Bills Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Bills: {selectedCustomer.customerName}</h2>
                                <p className="text-xs text-muted-foreground">Detail of pending credits per bill</p>
                            </div>
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {isLoadingBills ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : customerBills.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-muted/30 sticky top-0 z-10">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase">Order Info</th>
                                            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase">Bill Total</th>
                                            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase">Paid</th>
                                            <th className="text-left px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase text-red-400">Due</th>
                                            <th className="text-right px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {customerBills.map((bill) => (
                                            <tr 
                                                key={bill.id} 
                                                className="hover:bg-primary/5 transition-colors cursor-pointer group/row"
                                                onClick={() => setSelectedBill(bill)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-mono font-bold text-foreground group-hover/row:text-primary transition-colors">{bill.orderNumber}</p>
                                                        <Eye className="w-3 h-3 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px]">{formatDateTime(bill.createdAt)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-foreground">{formatCurrency(bill.total)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-emerald-400 font-medium">{formatCurrency(bill.amountPaid)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-red-400 font-bold">{formatCurrency(bill.amountDue)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover/row:translate-x-1 group-hover/row:text-primary transition-all" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-muted-foreground">No pending bills found for this customer.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Pending: </span>
                                <span className="text-lg font-bold text-red-400">{formatCurrency(selectedCustomer.totalDue)}</span>
                            </div>
                            <button 
                                onClick={() => setSelectedCustomer(null)}
                                className="px-6 py-2 bg-foreground text-background rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                Close Detail
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Items Detail Modal */}
            {selectedBill && (
                <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-primary p-6 text-primary-foreground">
                            <div className="flex justify-between items-start mb-4">
                                <button 
                                    onClick={() => setSelectedBill(null)}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Order Detail</span>
                            </div>
                            <h2 className="text-xl font-bold">#{selectedBill.orderNumber}</h2>
                            <p className="text-sm opacity-80">{formatDateTime(selectedBill.createdAt)}</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedBill.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border">
                                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                                            {item.product?.image ? (
                                                <img src={item.product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <Package className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{item.product?.name || "Product"}</p>
                                            <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-foreground">{formatCurrency((item.quantity || 1) * (item.price || 0))}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 space-y-2 border-t border-border pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(selectedBill.subtotal || selectedBill.total)}</span>
                                </div>
                                {selectedBill.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax</span>
                                        <span>{formatCurrency(selectedBill.tax)}</span>
                                    </div>
                                )}
                                {selectedBill.discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-400">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span>-{formatCurrency(selectedBill.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-black pt-2 border-t border-dashed border-border">
                                    <span>Total Amount</span>
                                    <span>{formatCurrency(selectedBill.total)}</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Paid</p>
                                    <p className="text-base font-bold text-emerald-500">{formatCurrency(selectedBill.amountPaid)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-400/5 border border-red-400/10 text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Due</p>
                                    <p className="text-base font-bold text-red-500">{formatCurrency(selectedBill.amountDue)}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedBill(null)}
                                className="w-full mt-6 py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                Back to Bill List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
