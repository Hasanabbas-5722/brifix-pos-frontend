"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Minus,
    Plus,
    ShoppingCart,
    Tag,
    Trash2,
    User,
    X,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn, formatCurrency } from "@/lib/utils";
import { CUSTOMERS } from "@/lib/data";

interface CartSidebarProps {
    onPayment: () => void;
    mobile?: boolean;
}

export function CartSidebar({ onPayment, mobile }: CartSidebarProps) {
    const {
        items,
        customer,
        globalDiscount,
        globalDiscountType,
        note,
        addItem,
        removeItem,
        updateQuantity,
        updateItemDiscount,
        setCustomer,
        setGlobalDiscount,
        setNote,
        clearCart,
        getSubtotal,
        getDiscount,
        getTax,
        getTotal,
        getItemCount,
        taxRate,
    } = useCartStore();

    const [showDiscount, setShowDiscount] = useState(false);
    const [showCustomer, setShowCustomer] = useState(false);
    const [showNote, setShowNote] = useState(false);
    const [discountInput, setDiscountInput] = useState(String(globalDiscount));
    const [discountTypeInput, setDiscountTypeInput] = useState<"percentage" | "fixed">(globalDiscountType);
    const [customerSearch, setCustomerSearch] = useState("");

    const subtotal = getSubtotal();
    const discount = getDiscount();
    const tax = getTax();
    const total = getTotal();
    const itemCount = getItemCount();

    const filteredCustomers = CUSTOMERS.filter(
        (c) =>
            !customerSearch ||
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone.includes(customerSearch)
    );

    const applyDiscount = () => {
        setGlobalDiscount(parseFloat(discountInput) || 0, discountTypeInput);
        setShowDiscount(false);
    };

    return (
        <div className={mobile ? "flex flex-col h-full" : "w-80 xl:w-96 flex flex-col border-l border-border bg-card/50"}>
            {/* Cart Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">Cart</span>
                    {itemCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* Customer selector */}
                    <button
                        onClick={() => setShowCustomer(!showCustomer)}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors",
                            customer
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        title="Select customer"
                    >
                        <User className="w-3.5 h-3.5" />
                        {customer ? customer.name.split(" ")[0] : "Guest"}
                    </button>
                    {/* Clear cart */}
                    {itemCount > 0 && (
                        <button
                            onClick={clearCart}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Clear cart"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Customer Picker Dropdown */}
            {showCustomer && (
                <div className="px-4 py-3 border-b border-border bg-muted/20 animate-fade-in">
                    <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search customer..."
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        autoFocus
                    />
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                        <button
                            onClick={() => { setCustomer(null); setShowCustomer(false); }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
                        >
                            Walk-in Customer (No account)
                        </button>
                        {filteredCustomers.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => { setCustomer(c); setShowCustomer(false); setCustomerSearch(""); }}
                                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-xs hover:bg-muted transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                    {c.avatar}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{c.name}</p>
                                    <p className="text-muted-foreground">{c.phone}</p>
                                </div>
                                <span className="ml-auto text-primary/70">{c.loyaltyPoints} pts</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-foreground">Cart is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Click products to add them to cart
                        </p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.product.id}
                                className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                            >
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                                    {item.product.image}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">
                                        {item.product.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatCurrency(item.product.price)} × {item.quantity}
                                    </p>
                                    {item.discount > 0 && (
                                        <p className="text-[10px] text-emerald-400">
                                            -{item.discountType === "percentage" ? `${item.discount}%` : formatCurrency(item.discount)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <p className="text-xs font-bold text-foreground">
                                        {formatCurrency(
                                            (item.product.price -
                                                (item.discountType === "percentage"
                                                    ? item.product.price * (item.discount / 100)
                                                    : item.discount)) *
                                            item.quantity
                                        )}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                            className="w-5 h-5 rounded flex items-center justify-center bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-semibold w-5 text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            className="w-5 h-5 rounded flex items-center justify-center bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            {items.length > 0 && (
                <div className="border-t border-border">
                    {/* Actions */}
                    <div className="flex gap-2 p-3">
                        <button
                            onClick={() => setShowDiscount(!showDiscount)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                (globalDiscount > 0 || showDiscount)
                                    ? "border-primary/50 bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                            )}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            {globalDiscount > 0
                                ? `Discount (${globalDiscountType === "percentage" ? `${globalDiscount}%` : formatCurrency(globalDiscount)})`
                                : "Discount"}
                        </button>
                        <button
                            onClick={() => setShowNote(!showNote)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                (note || showNote)
                                    ? "border-primary/50 bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                            )}
                        >
                            Note {note && "✓"}
                        </button>
                    </div>

                    {/* Discount Panel */}
                    {showDiscount && (
                        <div className="px-3 pb-3 animate-fade-in">
                            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDiscountTypeInput("percentage")}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            discountTypeInput === "percentage"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        % Percent
                                    </button>
                                    <button
                                        onClick={() => setDiscountTypeInput("fixed")}
                                        className={cn(
                                            "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            discountTypeInput === "fixed"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        $ Fixed
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={discountInput}
                                        onChange={(e) => setDiscountInput(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        max={discountTypeInput === "percentage" ? "100" : undefined}
                                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={applyDiscount}
                                        className="px-4 py-2 bg-primary rounded-lg text-xs font-medium text-white hover:bg-primary/90 transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {globalDiscount > 0 && (
                                    <button
                                        onClick={() => { setGlobalDiscount(0, "percentage"); setDiscountInput("0"); }}
                                        className="w-full text-xs text-destructive hover:underline"
                                    >
                                        Remove discount
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Note Panel */}
                    {showNote && (
                        <div className="px-3 pb-3 animate-fade-in">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Order note..."
                                rows={2}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
                            />
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="px-4 py-3 space-y-1.5 border-t border-border">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Subtotal ({itemCount} items)</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-xs text-emerald-400">
                                <span>Discount</span>
                                <span>-{formatCurrency(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tax ({taxRate}%)</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
                            <span>Total</span>
                            <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>

                    {/* Pay Button */}
                    <div className="px-4 pb-4">
                        <button
                            onClick={onPayment}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-primary/30 shine-effect"
                        >
                            <span>Charge {formatCurrency(total)}</span>
                            <span className="ml-2 text-primary-foreground/60 text-sm font-normal">F10</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
