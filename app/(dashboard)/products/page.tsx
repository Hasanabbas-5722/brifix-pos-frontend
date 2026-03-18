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
    PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/types";
import { uploadApi, productsApi } from "@/lib/api/apis";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<ProductCategory>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    const handleFormSuccess = () => {
        setShowAddModal(false);
        setEditProduct(null);
        loadProducts(); // Refresh list after add/edit
    };

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productsApi.getAll();
            setProducts(data || []);
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filtered = products.filter((p) => {
        const matchCat = category === "all" || p.category === category;
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.barcode?.includes(q);
        return matchCat && matchSearch;
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

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

                <Link
                    href="/products/add"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Products", value: products.length, icon: Package, color: "text-blue-400" },
                    { label: "Active", value: products.filter(p => p.isActive).length, icon: CheckCircle, color: "text-emerald-400" },
                    { label: "Low Stock", value: products.filter(p => p.stock > 0 && p.stock <= p.minStock).length, icon: AlertCircle, color: "text-amber-400" },
                    { label: "Out of Stock", value: products.filter(p => p.stock === 0).length, icon: X, color: "text-red-400" },
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
                                    {product.image?.startsWith('http') ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        product.image || "📦"
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-medium text-foreground text-sm line-clamp-1">{product.name}</p>
                                        <p className="font-bold text-foreground">{formatCurrency(product.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
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
                                {["Product", "Category", "Price", "Cost", "Stock", "Status", "Actions"].map((h) => (
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
                                                    {product.image?.startsWith('http') ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        product.image || "📦"
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
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
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                                            try {
                                                                await productsApi.delete(product.id);
                                                                loadProducts();
                                                            } catch (err) {
                                                                alert("Failed to delete product.");
                                                            }
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                >
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
                    Showing {filtered.length} of {products.length} products
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {(showAddModal || editProduct) && (
                <ProductFormModal
                    product={editProduct}
                    onClose={() => { setShowAddModal(false); setEditProduct(null); }}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}

function ProductFormModal({ product, onClose, onSuccess }: { product: Product | null; onClose: () => void; onSuccess: () => void }) {
    const isEdit = !!product;
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image?.startsWith('http') ? product.image : null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        let finalImageUrl = product?.image || "📦";
            
        if (imageFile) {
            const formDataUpload = new FormData();
            formDataUpload.append("file", imageFile);
            formDataUpload.append("folder", "products");
            
            try {
                const uploadRes = await uploadApi.uploadImage(formDataUpload);
                if (uploadRes?.url) {
                    finalImageUrl = uploadRes.url;
                }
            } catch (uploadErr) {
                console.error("Image upload failed", uploadErr);
                alert("Image upload failed. Proceeding without new image.");
            }
        }

        const payload: Partial<Product> = {
            name: formData.get("name") as string,
            barcode: formData.get("barcode") as string || undefined,
            category: (formData.get("category") as string) as ProductCategory,
            unit: formData.get("unit") as string,
            price: parseFloat(formData.get("price") as string) || 0,
            cost: parseFloat(formData.get("cost") as string) || 0,
            stock: parseInt(formData.get("stock") as string) || 0,
            minStock: parseInt(formData.get("minStock") as string) || 0,
            description: formData.get("description") as string,
            isActive: (form.elements.namedItem("isActive") as HTMLInputElement).checked,
            taxable: (form.elements.namedItem("taxable") as HTMLInputElement).checked,
            image: finalImageUrl,
        };

        try {
            if (isEdit && product?.id) {
                await productsApi.update(product.id, payload);
            } else {
                await productsApi.create(payload);
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                        <h2 className="text-lg font-bold text-foreground">
                            {isEdit ? "Edit Product" : "Add New Product"}
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Barcode</label>
                                <input
                                    name="barcode"
                                    defaultValue={product?.barcode}
                                    placeholder="8901234567890"
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category *</label>
                                <select
                                    name="category"
                                    required
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
                                    name="unit"
                                    defaultValue={product?.unit ?? "piece"}
                                    placeholder="piece, kg, liter..."
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Selling Price *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                    <input
                                        name="price"
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        defaultValue={product?.price}
                                        placeholder="0.00"
                                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cost Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                                    <input
                                        name="cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={product?.cost}
                                        placeholder="0.00"
                                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Current Stock</label>
                                <input
                                    name="stock"
                                    type="number"
                                    min="0"
                                    defaultValue={product?.stock}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Min Stock Alert</label>
                                <input
                                    name="minStock"
                                    type="number"
                                    min="0"
                                    defaultValue={product?.minStock}
                                    placeholder="5"
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={product?.description}
                                    placeholder="Product description..."
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary resize-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Profile Picture (Product Image)</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-muted flex flex-shrink-0 items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            product && !product.image?.startsWith('http') ? (
                                                <span className="text-2xl">{product.image || "📦"}</span>
                                            ) : (
                                                <Package className="w-6 h-6 text-muted-foreground" />
                                            )
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                    />
                                </div>
                            </div>
                            <div className="col-span-2 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="w-4 h-4 rounded accent-primary" />
                                    <span className="text-sm text-foreground">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="taxable" type="checkbox" defaultChecked={product?.taxable ?? true} className="w-4 h-4 rounded accent-primary" />
                                    <span className="text-sm text-foreground">Taxable</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isEdit ? "Save Changes" : "Add Product"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
