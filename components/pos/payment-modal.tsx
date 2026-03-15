"use client";

import { useEffect, useState } from "react";
import {
    Banknote,
    CheckCircle,
    CreditCard,
    Receipt,
    QrCode,
    SplitSquareHorizontal,
    Coins,
    Wallet,
    Search,
    UserPlus,
    CircleDashed,
    X,
    Loader2
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";
import { ReceiptModal } from "@/components/pos/receipt-modal";
import { ordersApi, settingsApi, creditsApi, customersApi } from "@/lib/api/apis";
import { User, Phone, Mail, History, ArrowRight, Save } from "lucide-react";

interface PaymentModalProps {
    onClose: () => void;
    total: number;
}

type PaymentMethod = "cash" | "card" | "qr" | "split" | "loyalty" | "storeCredit";

const PAYMENT_METHODS = [
    { id: "cash" as const, label: "Cash", icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { id: "card" as const, label: "Card", icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { id: "qr" as const, label: "QR Pay", icon: QrCode, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
    { id: "split" as const, label: "Split", icon: SplitSquareHorizontal, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    { id: "loyalty" as const, label: "Loyalty", icon: Coins, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { id: "storeCredit" as const, label: "Credit", icon: Wallet, color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
];

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export function PaymentModal({ onClose, total }: PaymentModalProps) {
    const { clearCart, items, customer, setCustomer, getSubtotal, getDiscount, getTax, taxRate } = useCartStore();
    const [method, setMethod] = useState<PaymentMethod>("cash");
    const [cashGiven, setCashGiven] = useState("");
    const [splitCash, setSplitCash] = useState(String(Math.floor(total / 2)));
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [checkoutDate, setCheckoutDate] = useState<Date>(new Date());
    const [availableMethods, setAvailableMethods] = useState<typeof PAYMENT_METHODS>(PAYMENT_METHODS);
    const [settings, setSettings] = useState<any>(null);
    const [showCreditSummary, setShowCreditSummary] = useState(false);
    const [isConfirmingCredit, setIsConfirmingCredit] = useState(false);
    const [customerCreditInfo, setCustomerCreditInfo] = useState<any>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({ name: "", email: "", phone: "" });
    const [isSavingCustomer, setIsSavingCustomer] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsApi.get();
                setSettings(response);
                if (response?.payment) {
                    const filtered = PAYMENT_METHODS.filter(pm => response.payment[pm.id]);
                    setAvailableMethods(filtered);
                    // Default to first available method if current one isn't available
                    if (filtered.length > 0 && !response.payment[method]) {
                        setMethod(filtered[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings for payment methods:", error);
            }
        };
        fetchSettings();
    }, []);

    const cashAmount = parseFloat(cashGiven) || 0;
    const change = cashAmount - total;
    const splitCard = total - (parseFloat(splitCash) || 0);

    const canProcess = () => {
        if (method === "cash") return cashAmount >= 0;
        if (method === "split") return parseFloat(splitCash) <= total && parseFloat(splitCash) >= 0;
        return true;
    };

    const handleProcess = async () => {
        if (!canProcess() || isLoading) return;
        setIsLoading(true);

        try {
            if (settings?.payment?.credit_system && !customer && !isConfirmingCredit) {
                // Fetch customers to show in the selector
                try {
                    const custs = await customersApi.getAll();
                    setAllCustomers(custs || []);
                } catch (e) {
                    console.error("Failed to load customers", e);
                }
                setIsConfirmingCredit(true);
                setIsLoading(false);
                return;
            }

            if (settings?.payment?.credit_system && customer && !isConfirmingCredit) {
                const creditData = await creditsApi.getCustomerCredit(customer.id);
                setCustomerCreditInfo(creditData);
                setIsConfirmingCredit(true);
                setIsLoading(false);
                return;
            }

            const orderPayload = {
                items: items.map((item: any) => ({
                    product: {
                        id: item.product.id,
                        name: item.product.name,
                        image: item.product.image,
                        price: item.product.price
                    },
                    quantity: item.quantity,
                    price: item.product.price
                })),
                customer: customer ? {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    avatar: customer.avatar
                } : null,
                paymentMethod: method,
                subtotal: getSubtotal(),
                tax: getTax(),
                discount: getDiscount(),
                total: total,
                amountPaid: method === "cash" ? cashAmount : method === "split" ? parseFloat(splitCash) + splitCard : total
            };

            const response = await ordersApi.create(orderPayload);
            setOrderNumber(response.data?.orderNumber || Math.floor(100000 + Math.random() * 900000).toString());
            setCheckoutDate(new Date());

            if (settings?.payment?.credit_system && customer) {
                try {
                    const creditData = await creditsApi.getCustomerCredit(customer.id);
                    setCustomerCreditInfo(creditData);
                } catch (err) {
                    console.error("Failed to fetch customer credit info", err);
                }
            }

            setSuccess(true);
            setIsConfirmingCredit(false);
        } catch (error) {
            console.error("Payment failed", error);
            // In a real app, maybe show a toast or error message state
            alert("Payment failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCustomer = async () => {
        if (!newCustomerForm.name) return;
        setIsSavingCustomer(true);
        try {
            const res = await customersApi.create(newCustomerForm);
            if (res.status === "success" && res.data) {
                setCustomer(res.data);
                const creditData = await creditsApi.getCustomerCredit(res.data.id);
                setCustomerCreditInfo(creditData);
                setIsCreatingCustomer(false);
                // Stay on confirming screen but now with the new customer
            }
        } catch (err) {
            alert("Failed to create customer");
        } finally {
            setIsSavingCustomer(false);
        }
    };

    const handleSelectCustomer = async (cust: any) => {
        setCustomer(cust);
        try {
            const creditData = await creditsApi.getCustomerCredit(cust.id);
            setCustomerCreditInfo(creditData);
        } catch (err) {
            console.error("Failed to fetch customer credit info", err);
        }
    };

    const filteredCusts = allCustomers.filter(c => 
        c.name?.toLowerCase().includes(customerSearch.toLowerCase()) || 
        c.phone?.includes(customerSearch)
    );


    if (isConfirmingCredit) {
        return (
            <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-primary/10 p-6 border-b border-primary/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white">
                                {customer ? <User className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {customer ? "Confirm Credit Details" : "Link Customer for Credit"}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {customer ? "Verify details before finalizing" : "A customer is required for credit sales"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {!customer ? (
                            <div className="space-y-4">
                                {isCreatingCustomer ? (
                                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                        <div className="grid gap-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Customer Name *</label>
                                            <input 
                                                value={newCustomerForm.name}
                                                onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary"
                                                placeholder="Enter full name..."
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
                                            <input 
                                                value={newCustomerForm.phone}
                                                onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary"
                                                placeholder="+91 00000 00000"
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                                            <input 
                                                value={newCustomerForm.email}
                                                onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:border-primary"
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button 
                                                onClick={() => setIsCreatingCustomer(false)}
                                                className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleCreateCustomer}
                                                disabled={isSavingCustomer || !newCustomerForm.name}
                                                className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                            >
                                                {isSavingCustomer ? <CircleDashed className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Save Customer
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input 
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary text-sm"
                                                placeholder="Search by name or phone..."
                                            />
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                                            {filteredCusts.length > 0 ? filteredCusts.map(c => (
                                                <button 
                                                    key={c.id}
                                                    onClick={() => handleSelectCustomer(c)}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 hover:border-primary/30 border border-transparent transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                            {c.name?.charAt(0)}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{c.phone || c.email || "No details"}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </button>
                                            )) : (
                                                <div className="py-8 text-center text-muted-foreground text-sm">
                                                    No customers found. Try adding one.
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-border">
                                            <button 
                                                onClick={() => setIsCreatingCustomer(true)}
                                                className="w-full py-4 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 font-bold text-primary group"
                                            >
                                                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                Register New Customer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {customer.avatar || customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{customer.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{customer.email || customer.phone || "No contact info"}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setCustomer(null)}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/10 text-red-500 font-bold hover:bg-red-400/20 transition-colors"
                                    >Change</button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-xl bg-muted/20 border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Bill</p>
                                        <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10">
                                        <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">Previous Credit</p>
                                        <p className="text-lg font-bold text-amber-500">{formatCurrency(customerCreditInfo?.totalDue || 0)}</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold text-primary uppercase">New Total Outstanding</p>
                                        <p className="text-2xl font-black text-primary">
                                            {formatCurrency((customerCreditInfo?.totalDue || 0) + (total - (method === "cash" ? cashAmount : method === "split" ? parseFloat(splitCash) + splitCard : total)))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {customer && !isCreatingCustomer && (
                                <button
                                    onClick={handleProcess}
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Completing Order...
                                        </>
                                    ) : (
                                        <>
                                            Finalize & Complete Order
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setIsConfirmingCredit(false);
                                    setCustomer(null); // Clean up if they back out entirely
                                }}
                                disabled={isLoading}
                                className="w-full py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase tracking-widest"
                            >
                                Back to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-sm mx-4 animate-fade-in relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Payment {change < 0 ? "Processed" : "Successful"}!</h2>
                    <p className="text-muted-foreground mb-4">
                        {formatCurrency(Math.min(cashAmount, total))} received via {method}
                    </p>
                    {method === "cash" && change > 0 && (
                        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-muted-foreground">Change Due</p>
                            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(change)}</p>
                        </div>
                    )}
                    {change < 0 && (
                        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-muted-foreground">Amount Due (Credit)</p>
                            <p className="text-3xl font-bold text-amber-400">{formatCurrency(Math.abs(change))}</p>
                        </div>
                    )}
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => setShowReceipt(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors font-medium">
                                <Receipt className="w-4 h-4" />
                                View Receipt
                            </button>
                            <button
                                onClick={() => { clearCart(); onClose(); }}
                                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                            >
                                New Sale
                            </button>
                        </div>
                        {settings?.payment?.credit_system && customer && (
                            <button
                                onClick={() => setShowCreditSummary(true)}
                                className="w-full py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-500 text-sm font-bold hover:bg-amber-400/20 transition-all flex items-center justify-center gap-2"
                            >
                                <History className="w-4 h-4" />
                                Customer Credit Summary
                            </button>
                        )}
                    </div>
                </div>

                {showReceipt && (
                    <ReceiptModal
                        onClose={() => setShowReceipt(false)}
                        items={items}
                        subtotal={getSubtotal()}
                        tax={getTax()}
                        discount={getDiscount()}
                        total={total}
                        paymentMethod={method}
                        amountPaid={method === "cash" ? cashAmount : method === "split" ? parseFloat(splitCash) + splitCard : total}
                        change={method === "cash" ? change : undefined}
                        date={checkoutDate}
                        orderNumber={orderNumber}
                    />
                )}

                {showCreditSummary && customer && (
                    <CreditSummaryModal
                        customer={customer}
                        creditInfo={customerCreditInfo}
                        onClose={() => setShowCreditSummary(false)}
                        onNewSale={() => { clearCart(); onClose(); }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground">Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Amount Due */}
                    <div className="text-center py-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <p className="text-sm text-muted-foreground">Amount Due</p>
                        <p className="text-4xl font-bold text-primary mt-1">{formatCurrency(total)}</p>
                        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Subtotal: {formatCurrency(getSubtotal())}</span>
                            {getDiscount() > 0 && <span className="text-emerald-400">-{formatCurrency(getDiscount())}</span>}
                            <span>Tax: {formatCurrency(getTax())}</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className={cn(
                        "grid gap-2",
                        availableMethods.length <= 4 ? "grid-cols-4" : "grid-cols-3"
                    )}>
                        {availableMethods.map((pm) => {
                            const Icon = pm.icon;
                            return (
                                <button
                                    key={pm.id}
                                    onClick={() => setMethod(pm.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 py-3 rounded-xl border text-xs font-medium transition-all duration-200",
                                        method === pm.id
                                            ? `${pm.bg} ${pm.color} scale-[1.02]`
                                            : "border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    {pm.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Cash Payment */}
                    {method === "cash" && (
                        <div className="space-y-3 animate-fade-in">
                            <label className="text-sm font-medium text-foreground">Cash Received</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                                <input
                                    type="number"
                                    value={cashGiven}
                                    onChange={(e) => setCashGiven(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-2xl font-bold text-foreground outline-none focus:border-primary"
                                    autoFocus
                                />
                            </div>
                            {/* Quick amounts */}
                            <div className="flex gap-2">
                                {QUICK_AMOUNTS.map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setCashGiven(String(amt))}
                                        className={cn(
                                            "flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                                            cashGiven === String(amt)
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCashGiven(total.toFixed(2))}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                                        cashGiven === total.toFixed(2)
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Exact
                                </button>
                            </div>
                            {cashAmount > 0 && (
                                <div className={cn(
                                    "flex justify-between items-center p-4 rounded-xl",
                                    change >= 0
                                        ? "bg-emerald-400/10 border border-emerald-400/20"
                                        : "bg-red-400/10 border border-red-400/20"
                                )}>
                                    <span className="text-sm font-medium text-foreground">
                                        {change >= 0 ? "Change Due" : "Amount Short"}
                                    </span>
                                    <span className={cn(
                                        "text-2xl font-bold",
                                        change >= 0 ? "text-emerald-400" : "text-red-400"
                                    )}>
                                        {formatCurrency(Math.abs(change))}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Card Payment */}
                    {method === "card" && (
                        <div className="py-6 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-blue-400/10 flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="w-8 h-8 text-blue-400" />
                            </div>
                            <p className="text-sm text-foreground font-medium">Swipe, tap, or insert card</p>
                            <p className="text-xs text-muted-foreground mt-1">Waiting for card terminal...</p>
                            <div className="flex justify-center gap-1 mt-4">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-blue-400/50"
                                        style={{ animation: `pulse 1.5s ${i * 0.3}s infinite` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QR Payment */}
                    {method === "qr" && (
                        <div className="py-6 text-center animate-fade-in">
                            <div className="w-36 h-36 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg">
                                <div className="text-6xl">
                                    <QrCode className="w-24 h-24 text-gray-900" strokeWidth={1} />
                                </div>
                            </div>
                            <p className="text-sm text-foreground font-medium">Scan QR to Pay</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total: <span className="text-primary font-bold">{formatCurrency(total)}</span>
                            </p>
                        </div>
                    )}

                    {method === "split" && (
                        <div className="space-y-3 animate-fade-in">
                            <label className="text-sm font-medium text-foreground">Cash Amount</label>
                            <input
                                type="number"
                                value={splitCash}
                                onChange={(e) => setSplitCash(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-xl font-bold outline-none focus:border-primary"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-center">
                                    <p className="text-xs text-muted-foreground">Cash</p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {formatCurrency(parseFloat(splitCash) || 0)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-blue-400/10 border border-blue-400/20 text-center">
                                    <p className="text-xs text-muted-foreground">Card</p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {formatCurrency(splitCard > 0 ? splitCard : 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loyalty Payment */}
                    {method === "loyalty" && (
                        <div className="py-6 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4">
                                <Coins className="w-8 h-8 text-yellow-400" />
                            </div>
                            <p className="text-sm text-foreground font-medium">Redeem Loyalty Points</p>
                            <p className="text-xs text-muted-foreground mt-1">Available Points: 1,250 ($12.50)</p>
                        </div>
                    )}

                    {method === "storeCredit" && (
                        <div className="py-6 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-orange-400/10 flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-8 h-8 text-orange-400" />
                            </div>
                            <p className="text-sm text-foreground font-medium">Use Store Credit</p>
                            <p className="text-xs text-muted-foreground mt-1">Available Credit: $45.00</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProcess}
                        disabled={!canProcess() || isLoading}
                        className={cn(
                            "flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-base transition-all duration-150 shine-effect",
                            canProcess() && !isLoading
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-[0.98]"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                            </div>
                        ) : method === "cash" && cashAmount < total ? (
                            "Enter Amount"
                        ) : (
                            "Process Payment"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreditSummaryModal({ customer, creditInfo, onClose, onNewSale }: {
    customer: any;
    creditInfo: any;
    onClose: () => void;
    onNewSale: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-amber-400 p-8 text-amber-950">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <History className="w-8 h-8 text-white" />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <h2 className="text-3xl font-black mb-1">Credit Summary</h2>
                    <p className="text-amber-900/70 font-medium">Detailed customer credit status</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Customer Info Card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/20">
                            {customer.avatar || customer.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-foreground truncate">{customer.name}</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{customer.email || "No email"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{customer.phone || "No contact info"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credit Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 transition-all hover:bg-emerald-400/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Paid</p>
                            <p className="text-2xl font-black text-emerald-500">{formatCurrency(creditInfo?.totalPaid || 0)}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-red-400/5 border border-red-400/10 transition-all hover:bg-red-400/10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Due</p>
                            <p className="text-2xl font-black text-red-500">{formatCurrency(creditInfo?.totalDue || 0)}</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/10 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 blur-3xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-500" />
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 pointer-events-none">Total Lifetime Billed</p>
                        <p className="text-3xl font-black text-foreground">{formatCurrency(creditInfo?.totalBilled || 0)}</p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-border">
                        <button
                            onClick={onNewSale}
                            className="w-full py-4 rounded-2xl bg-foreground text-background font-black text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 group"
                        >
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            Next Customer (New Sale)
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors uppercase tracking-widest"
                        >
                            Back to Success Screen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

