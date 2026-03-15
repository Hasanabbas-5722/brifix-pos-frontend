"use client";

import { useState, useEffect, useRef } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartSidebar } from "@/components/pos/cart-sidebar";
import { PaymentModal } from "@/components/pos/payment-modal";
import { CATEGORIES } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { Barcode, Search, ShoppingCart, X, Coffee } from "lucide-react";
import type { ProductCategory } from "@/lib/types";
import { useCartStore } from "@/store/cart-store";
import { settingsApi } from "@/lib/api/apis";

export default function POSPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
    const [showPayment, setShowPayment] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [isTeaMode, setIsTeaMode] = useState(false);
    
    const searchRef = useRef<HTMLInputElement>(null);
    const { getItemCount, getTotal, addItem } = useCartStore();

    const itemCount = mounted ? getItemCount() : 0;
    const total = mounted ? getTotal() : 0;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.get();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.key === "F1" || e.key === "/") && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                searchRef.current?.focus();
            }
            if (e.key === "F2") { e.preventDefault(); setBarcodeMode((p) => !p); }
            if (e.key === "F10") { e.preventDefault(); if (getItemCount() > 0) setShowPayment(true); }
            if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [getItemCount]);

    return (
        <div className="flex h-full overflow-hidden relative">
            {/* Left – Product Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Search & Filters */}
                <div className="p-3 md:p-4 border-b border-border space-y-2 md:space-y-3 flex-shrink-0">
                    <div className="flex gap-2">
                        <div
                            className={cn(
                                "flex-1 flex items-center gap-2 px-3 py-2 md:py-2.5 rounded-xl border transition-all duration-200",
                                barcodeMode
                                    ? "border-amber-500/50 bg-amber-500/5"
                                    : "border-border bg-muted/30 focus-within:border-primary"
                            )}
                        >
                            {barcodeMode ? (
                                <Barcode className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            ) : (
                                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={barcodeMode ? "Scan barcode..." : "Search products..."}
                                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setBarcodeMode((p) => !p)}
                            className={cn(
                                "px-2.5 md:px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 flex-shrink-0",
                                barcodeMode
                                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                                    : "border-border text-muted-foreground hover:text-foreground"
                            )}
                            title="Barcode mode (F2)"
                        >
                            <Barcode className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs">F2</span>
                        </button>

                        {settings?.store?.parlour && (
                            <button
                                onClick={() => setIsTeaMode((p) => !p)}
                                className={cn(
                                    "px-2.5 md:px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 flex-shrink-0",
                                    isTeaMode
                                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                )}
                                title="Tea Mode"
                            >
                                <Coffee className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs">Tea</span>
                            </button>
                        )}
                    </div>

                    {isTeaMode && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <Coffee className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground">Tea Service Active</h4>
                                    <p className="text-[10px] text-muted-foreground">Add quick tea to order</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => addItem({
                                        id: "tea-half",
                                        name: "Tea (Half)",
                                        price: settings?.store?.tea_half_price || 10,
                                        category: "beverages",
                                        image: "☕",
                                        stock: 999,
                                        unit: "cup"
                                    } as any)}
                                    className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all whitespace-nowrap"
                                >
                                    + Half (₹{settings?.store?.tea_half_price || 10})
                                </button>
                                <button 
                                    onClick={() => addItem({
                                        id: "tea-full",
                                        name: "Tea (Full)",
                                        price: settings?.store?.tea_full_price || 15,
                                        category: "beverages",
                                        image: "☕",
                                        stock: 999,
                                        unit: "cup"
                                    } as any)}
                                    className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors whitespace-nowrap"
                                >
                                    + Full (₹{settings?.store?.tea_full_price || 15})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Category Filters */}
                    <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as ProductCategory)}
                                className={cn(
                                    "flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                                    selectedCategory === cat.id
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                )}
                            >
                                <span>{cat.icon}</span>
                                <span className="hidden xs:inline sm:inline">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Keyboard shortcuts – desktop only */}
                <div className="hidden md:flex px-4 py-2 bg-muted/20 border-b border-border items-center gap-4 overflow-x-auto flex-shrink-0">
                    {[
                        { key: "F1 / /", label: "Search" },
                        { key: "F2", label: "Barcode" },
                        { key: "F10", label: "Pay" },
                        { key: "ESC", label: "Clear" },
                    ].map((s) => (
                        <div key={s.key} className="flex items-center gap-1.5 flex-shrink-0">
                            <kbd className="text-[10px] font-mono bg-muted border border-border rounded px-1.5 py-0.5 text-foreground">
                                {s.key}
                            </kbd>
                            <span className="text-xs text-muted-foreground">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-3 md:p-4">
                    <ProductGrid search={search} category={selectedCategory} />
                </div>

                {/* Mobile cart FAB */}
                {itemCount > 0 && (
                    <div className="md:hidden p-3 border-t border-border bg-background flex-shrink-0">
                        <button
                            onClick={() => setShowMobileCart(true)}
                            className="w-full flex items-center justify-between py-3.5 px-5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 font-bold text-sm"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                                    {itemCount}
                                </span>
                                <span>View Cart</span>
                            </div>
                            <span>{formatCurrency(total)}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Desktop cart sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                <CartSidebar onPayment={() => setShowPayment(true)} />
            </div>

            {/* Mobile cart bottom sheet */}
            {showMobileCart && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowMobileCart(false)}
                    />
                    {/* Sheet */}
                    <div className="relative bg-card rounded-t-2xl border-t border-border max-h-[85vh] flex flex-col animate-slide-in">
                        {/* Drag handle */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
                            <span className="font-semibold text-foreground">Cart</span>
                            <button
                                onClick={() => setShowMobileCart(false)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <CartSidebar
                                onPayment={() => {
                                    setShowMobileCart(false);
                                    setShowPayment(true);
                                }}
                                mobile
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal onClose={() => setShowPayment(false)} total={total} />
            )}
        </div>
    );
}
