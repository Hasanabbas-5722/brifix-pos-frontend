"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Package, Plus, Search, SlidersHorizontal, TruckIcon, X } from "lucide-react";
import { PRODUCTS, SUPPLIERS } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function InventoryPage() {
    const [search, setSearch] = useState("");
    const [filterStock, setFilterStock] = useState("all");
    const [showAdjust, setShowAdjust] = useState<Product | null>(null);
    const [activeTab, setActiveTab] = useState<"stock" | "suppliers">("stock");

    const filtered = PRODUCTS.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        if (filterStock === "out") return matchSearch && p.stock === 0;
        if (filterStock === "low") return matchSearch && p.stock > 0 && p.stock <= p.minStock;
        if (filterStock === "ok") return matchSearch && p.stock > p.minStock;
        return matchSearch;
    });

    const outCount = PRODUCTS.filter((p) => p.stock === 0).length;
    const lowCount = PRODUCTS.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
    const okCount = PRODUCTS.filter((p) => p.stock > p.minStock).length;

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-400/10 flex-shrink-0"><Package className="w-5 h-5 text-emerald-400" /></div>
                    <div><p className="text-xl font-bold text-emerald-400">{okCount}</p><p className="text-xs text-muted-foreground">Well Stocked</p></div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-400/10 flex-shrink-0"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                    <div><p className="text-xl font-bold text-amber-400">{lowCount}</p><p className="text-xs text-muted-foreground">Low Stock Alert</p></div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-400/10 flex-shrink-0"><X className="w-5 h-5 text-red-400" /></div>
                    <div><p className="text-xl font-bold text-red-400">{outCount}</p><p className="text-xs text-muted-foreground">Out of Stock</p></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                {["stock", "suppliers"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as "stock" | "suppliers")}
                        className={cn("px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium capitalize transition-all whitespace-nowrap", activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >
                        {tab === "stock" ? "📦 Stock" : "🚚 Suppliers"}
                    </button>
                ))}
            </div>

            {activeTab === "stock" ? (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 focus-within:border-primary transition-all">
                            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto scrollbar-none">
                            {[{ id: "all", label: "All" }, { id: "ok", label: "✅ In Stock" }, { id: "low", label: "⚠️ Low" }, { id: "out", label: "❌ Out" }].map((f) => (
                                <button key={f.id} onClick={() => setFilterStock(f.id)} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0", filterStock === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{f.label}</button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: Card list */}
                    <div className="md:hidden space-y-3">
                        {filtered.map((product) => {
                            const isOut = product.stock === 0;
                            const isLow = !isOut && product.stock <= product.minStock;
                            return (
                                <div key={product.id} className={cn("bg-card border rounded-xl p-4", isOut ? "border-red-500/20 bg-red-500/3" : isLow ? "border-amber-500/20 bg-amber-500/3" : "border-border")}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{product.image}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm">{product.name}</p>
                                            <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
                                        </div>
                                        {isOut ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-400 font-medium flex-shrink-0">Out</span>
                                        ) : isLow ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 font-medium flex-shrink-0">Low</span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 font-medium flex-shrink-0">OK</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Stock: <span className={cn("font-bold", isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400")}>{product.stock}</span> / {product.minStock} min</span>
                                                <span>{product.unit}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", isOut ? "w-0" : isLow ? "bg-amber-400" : "bg-emerald-400")} style={{ width: isOut ? "0%" : `${Math.min((product.stock / (product.minStock * 3)) * 100, 100)}%` }} />
                                            </div>
                                        </div>
                                        <button onClick={() => setShowAdjust(product)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex-shrink-0">
                                            <SlidersHorizontal className="w-3 h-3" /> Adjust
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        {["Product", "SKU", "Category", "Current Stock", "Min Stock", "Status", "Action"].map((h) => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((product) => {
                                        const isOut = product.stock === 0;
                                        const isLow = !isOut && product.stock <= product.minStock;
                                        const pct = isOut ? 0 : Math.min((product.stock / (product.minStock * 3)) * 100, 100);
                                        return (
                                            <tr key={product.id} className={cn("hover:bg-muted/20 transition-colors", isOut && "bg-red-500/3", isLow && "bg-amber-500/3")}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl">{product.image}</span>
                                                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><p className="text-xs font-mono text-muted-foreground">{product.sku}</p></td>
                                                <td className="px-4 py-3"><span className="text-xs text-muted-foreground capitalize">{product.category}</span></td>
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("text-sm font-bold", isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400")}>{product.stock}</span>
                                                            <span className="text-xs text-muted-foreground">{product.unit}</span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full", isOut ? "w-0" : isLow ? "bg-amber-400" : "bg-emerald-400")} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{product.minStock}</span></td>
                                                <td className="px-4 py-3">
                                                    {isOut ? <span className="text-xs px-2 py-1 rounded-full bg-red-400/10 text-red-400 font-medium">Out of Stock</span>
                                                        : isLow ? <span className="text-xs px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 font-medium">Low Stock</span>
                                                            : <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 font-medium">In Stock</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => setShowAdjust(product)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors">
                                                        <SlidersHorizontal className="w-3 h-3" /> Adjust
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {SUPPLIERS.map((supplier) => (
                        <div key={supplier.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                                    <TruckIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground truncate">{supplier.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{supplier.email}</p>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                                <div className="flex justify-between"><span>Phone</span><span className="text-foreground">{supplier.phone}</span></div>
                                <div className="flex justify-between"><span>Products</span><span className="text-foreground">{supplier.productsCount}</span></div>
                                <div className="flex justify-between"><span>Since</span><span className="text-foreground">{formatDate(supplier.createdAt)}</span></div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Contact</button>
                                <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Order Stock</button>
                            </div>
                        </div>
                    ))}
                    <button className="flex flex-col items-center justify-center gap-3 bg-card border border-dashed border-border rounded-xl p-5 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors min-h-[160px]">
                        <Plus className="w-8 h-8" />
                        <span className="text-sm font-medium">Add Supplier</span>
                    </button>
                </div>
            )}

            {showAdjust && <AdjustStockModal product={showAdjust} onClose={() => setShowAdjust(null)} />}
        </div>
    );
}

function AdjustStockModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const [type, setType] = useState<"add" | "remove" | "set">("add");
    const [amount, setAmount] = useState("");

    const newStock = () => {
        const n = parseInt(amount) || 0;
        if (type === "add") return product.stock + n;
        if (type === "remove") return Math.max(0, product.stock - n);
        return n;
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-in sm:animate-fade-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-bold text-foreground text-sm md:text-base">Adjust Stock — {product.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                        <span className="text-sm text-muted-foreground">Current Stock</span>
                        <span className="text-xl font-bold text-foreground">{product.stock} {product.unit}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[{ id: "add", label: "Add", icon: ArrowUp, color: "text-emerald-400" }, { id: "remove", label: "Remove", icon: ArrowDown, color: "text-red-400" }, { id: "set", label: "Set", icon: SlidersHorizontal, color: "text-blue-400" }].map((t) => {
                            const Icon = t.icon;
                            return (
                                <button key={t.id} onClick={() => setType(t.id as typeof type)} className={cn("flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all", type === t.id ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
                                    <Icon className={`w-4 h-4 ${type === t.id ? "" : t.color}`} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Quantity</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="0" className="w-full px-3 py-3 rounded-xl border border-border bg-background text-2xl font-bold text-foreground outline-none focus:border-primary text-center" />
                    </div>
                    {amount && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <span className="text-sm text-muted-foreground">New Stock</span>
                            <span className="text-lg font-bold text-primary">{newStock()} {product.unit}</span>
                        </div>
                    )}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Reason</label>
                        <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary">
                            <option value="">Select reason...</option>
                            <option>Stock received from supplier</option>
                            <option>Damaged goods</option>
                            <option>Manual count adjustment</option>
                            <option>Return from customer</option>
                            <option>Internal use</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">Apply</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
