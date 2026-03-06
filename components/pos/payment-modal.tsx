"use client";

import { useState } from "react";
import {
    Banknote,
    CheckCircle,
    CreditCard,
    Printer,
    QrCode,
    SplitSquareHorizontal,
    X,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
    onClose: () => void;
    total: number;
}

type PaymentMethod = "cash" | "card" | "qr" | "split";

const PAYMENT_METHODS = [
    { id: "cash" as const, label: "Cash", icon: Banknote, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { id: "card" as const, label: "Card", icon: CreditCard, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { id: "qr" as const, label: "QR Pay", icon: QrCode, color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
    { id: "split" as const, label: "Split", icon: SplitSquareHorizontal, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
];

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

export function PaymentModal({ onClose, total }: PaymentModalProps) {
    const { clearCart, items, customer, getSubtotal, getDiscount, getTax, taxRate } = useCartStore();
    const [method, setMethod] = useState<PaymentMethod>("cash");
    const [cashGiven, setCashGiven] = useState("");
    const [splitCash, setSplitCash] = useState(String(Math.floor(total / 2)));
    const [success, setSuccess] = useState(false);

    const cashAmount = parseFloat(cashGiven) || 0;
    const change = cashAmount - total;
    const splitCard = total - (parseFloat(splitCash) || 0);

    const canProcess = () => {
        if (method === "cash") return cashAmount >= total;
        if (method === "split") return parseFloat(splitCash) <= total && parseFloat(splitCash) >= 0;
        return true; // card and QR
    };

    const handleProcess = () => {
        if (!canProcess()) return;
        setSuccess(true);
        setTimeout(() => {
            clearCart();
            onClose();
        }, 2500);
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-2xl p-12 text-center max-w-sm mx-4 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                    <p className="text-muted-foreground mb-4">
                        {formatCurrency(total)} received via {method}
                    </p>
                    {method === "cash" && change > 0 && (
                        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4 mb-4">
                            <p className="text-sm text-muted-foreground">Change Due</p>
                            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(change)}</p>
                        </div>
                    )}
                    <div className="flex gap-2 mt-4">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                        <button
                            onClick={() => { clearCart(); onClose(); }}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                            New Sale
                        </button>
                    </div>
                </div>
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
                    <div className="grid grid-cols-4 gap-2">
                        {PAYMENT_METHODS.map((pm) => {
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

                    {/* Split Payment */}
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
                        disabled={!canProcess()}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-base transition-all duration-150 shine-effect",
                            canProcess()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-[0.98]"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {method === "cash" && cashAmount < total
                            ? "Enter Amount"
                            : "Process Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
