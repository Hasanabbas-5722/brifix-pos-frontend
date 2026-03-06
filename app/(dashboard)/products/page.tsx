"use client";

import { useState } from "react";
import {
    AlertCircle,
    Edit,
    Plus,
    Search,
    Trash2,
    X,
    Package,
    CheckCircle,
} from "lucide-react";
import { PRODUCTS, CATEGORIES, CATEGORY_COLORS } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/types";

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<ProductCategory>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const filtered = PRODUCTS.filter((p) => {
        const matchCat = category === "all" || p.category === category;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.includes(q);
        return matchCat && matchSearch;
    });

    return (
        <div className="p-6 space-y-5 animate-fade-in">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 focus-within:border-primary transition-all">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
                </div>

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                    ))}
                </select>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Products", value: PRODUCTS.length, icon: Package, color: "text-blue-400" },
                    { label: "Active", value: PRODUCTS.filter(p => p.isActive).length, icon: CheckCircle, color: "text-emerald-400" },
                    { label: "Low Stock", value: PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.minStock).length, icon: AlertCircle, color: "text-amber-400" },
                    { label: "Out of Stock", value: PRODUCTS.filter(p => p.stock === 0).length, icon: X, color: "text-red-400" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${s.color}`} />
                            <div>
                                <p className="text-xl font-bold text-foreground">{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: Card list */}
            <div className="md:hidden space-y-3">
                {filtered.map((product) => {
                    const isOut = product.stock === 0;
                    const isLow = !isOut && product.stock <= product.minStock;
                    return (
                        <div key={product.id} className={cn("bg-card border rounded-xl p-4", isOut ? "border-red-500/20 bg-red-500/3" : isLow ? "border-amber-500/20 bg-amber-500/3" : "border-border")}>
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                                    style={{ background: `${CATEGORY_COLORS[product.category]}15` }}
                                >
                                    {product.image}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-medium text-foreground text-sm line-clamp-1">{product.name}</p>
                                        <p className="font-bold text-foreground">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
                                        <span
                                            className="text-[10px] px-1.5 py-0.5 rounded capitalize font-medium"
                                            style={{ background: `${CATEGORY_COLORS[product.category]}20`, color: CATEGORY_COLORS[product.category] }}
                                        >
                                            {product.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1.5">
                                            {isOut ? (
                                                <span className="text-xs font-medium text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Out</span>
                                            ) : isLow ? (
                                                <span className="text-xs font-medium text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {product.stock} Low</span>
                                            ) : (
                                                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {product.stock} OK</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setEditProduct(product)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                            <tr>
                                {["Product", "SKU", "Category", "Price", "Cost", "Stock", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.map((product) => {
                                const isLow = product.stock > 0 && product.stock <= product.minStock;
                                const isOut = product.stock === 0;
                                return (
                                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                                                    style={{ background: `${CATEGORY_COLORS[product.category]}15` }}
                                                >
                                                    {product.image}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs font-mono text-muted-foreground">{product.sku}</p>
                                            <p className="text-[10px] text-muted-foreground/60">{product.barcode}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                                                style={{
                                                    background: `${CATEGORY_COLORS[product.category]}20`,
                                                    color: CATEGORY_COLORS[product.category],
                                                }}
                                            >
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-foreground">{formatCurrency(product.price)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-muted-foreground">{formatCurrency(product.cost)}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                {isOut ? (
                                                    <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                                                        <X className="w-3 h-3" /> Out of stock
                                                    </span>
                                                ) : isLow ? (
                                                    <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {product.stock} (low)
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-foreground">{product.stock} {product.unit}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full font-medium",
                                                product.isActive
                                                    ? "bg-emerald-400/10 text-emerald-400"
                                                    : "bg-red-400/10 text-red-400"
                                            )}>
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditProduct(product)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground">No products found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
                <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                    Showing {filtered.length} of {PRODUCTS.length} products
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || editProduct) && (
                <ProductFormModal
                    product={editProduct}
                    onClose={() => { setShowAddModal(false); setEditProduct(null); }}
                />
            )}
        </div>
    );
}

function ProductFormModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
    const isEdit = !!product;
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
                    <h2 className="text-lg font-bold text-foreground">
                        {isEdit ? "Edit Product" : "Add New Product"}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Product Name *</label>
                            <input
                                defaultValue={product?.name}
                                placeholder="e.g. Caramel Macchiato"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">SKU *</label>
                            <input
                                defaultValue={product?.sku}
                                placeholder="BEV-001"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Barcode</label>
                            <input
                                defaultValue={product?.barcode}
                                placeholder="8901234567890"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category *</label>
                            <select
                                defaultValue={product?.category}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                            >
                                {CATEGORIES.filter(c => c.id !== "all").map((c) => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Unit</label>
                            <input
                                defaultValue={product?.unit ?? "piece"}
                                placeholder="piece, kg, liter..."
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Selling Price *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <input
                                    type="number"
                                    defaultValue={product?.price}
                                    placeholder="0.00"
                                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cost Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <input
                                    type="number"
                                    defaultValue={product?.cost}
                                    placeholder="0.00"
                                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Stock</label>
                            <input
                                type="number"
                                defaultValue={product?.stock}
                                placeholder="0"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Stock Alert</label>
                            <input
                                type="number"
                                defaultValue={product?.minStock}
                                placeholder="5"
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                            <textarea
                                defaultValue={product?.description}
                                placeholder="Product description..."
                                rows={2}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary resize-none"
                            />
                        </div>
                        <div className="col-span-2 flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={product?.isActive ?? true} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm text-foreground">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={product?.taxable ?? true} className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm text-foreground">Taxable</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                        >
                            {isEdit ? "Save Changes" : "Add Product"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
