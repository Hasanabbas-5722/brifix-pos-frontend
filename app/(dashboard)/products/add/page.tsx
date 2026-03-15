"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    Package,
    Save,
    Image as ImageIcon,
    Tag,
    Barcode,
    DollarSign,
    Layers,
    AlertCircle,
    Info,
    CheckCircle,
} from "lucide-react";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product, ProductCategory } from "@/lib/types";
import { productsApi } from "@/lib/api/apis";

export default function AddProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload: Partial<Product> = {
            name: formData.get("name") as string,
            sku: formData.get("sku") as string,
            barcode: (formData.get("barcode") as string) || undefined,
            category: (formData.get("category") as string) as ProductCategory,
            unit: formData.get("unit") as string,
            price: parseFloat(formData.get("price") as string) || 0,
            cost: parseFloat(formData.get("cost") as string) || 0,
            stock: parseInt(formData.get("stock") as string) || 0,
            minStock: parseInt(formData.get("minStock") as string) || 0,
            description: formData.get("description") as string,
            isActive: (form.elements.namedItem("isActive") as HTMLInputElement).checked,
            taxable: (form.elements.namedItem("taxable") as HTMLInputElement).checked,
            image: "📦", // Default emoji
        };

        try {
            await productsApi.create(payload);
            setSuccess(true);
            setTimeout(() => {
                router.push("/products");
            }, 1500);
        } catch (error) {
            console.error("Failed to create product", error);
            alert("Failed to create product. Please check your data.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Product Added!</h2>
                <p className="text-muted-foreground mt-2">Redirecting to product list...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <button onClick={() => router.push("/products")} className="hover:text-primary transition-colors">Products</button>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground font-medium">Add New Product</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary" />
                        Create New Product
                    </h1>
                    <p className="text-sm text-muted-foreground">Add a new item to your catalog and set initial inventory levels.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/20">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Product Title *</label>
                                <div className="relative group">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="name"
                                        required
                                        placeholder="Enter product title..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">SKU (Stock Keeping Unit) *</label>
                                    <div className="relative group">
                                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="sku"
                                            required
                                            placeholder="PROD-001"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Barcode / EAN</label>
                                    <div className="relative group">
                                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            name="barcode"
                                            placeholder="890123456789"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    placeholder="Write something about this product..."
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/20">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                Pricing & Costs
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Selling Price *</label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                                        <input
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xl font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Cost Price (for margin tracking)</label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                                        <input
                                            name="cost"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-primary/5 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                                <p className="text-xs text-muted-foreground">Cost price is optional but recommended for calculating profit margins.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-muted/20">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Layers className="w-4 h-4 text-primary" />
                                Inventory Management
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Initial Stock</label>
                                    <input
                                        name="stock"
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Minimum Stock Level</label>
                                    <input
                                        name="minStock"
                                        type="number"
                                        placeholder="5"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Stock Unit</label>
                                    <input
                                        name="unit"
                                        placeholder="piece, kg, liter..."
                                        defaultValue="piece"
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Category *</label>
                            <select
                                name="category"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                            >
                                {CATEGORIES.filter(c => c.id !== "all").map((c) => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors group">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-semibold text-foreground">Available for sale</span>
                                    <p className="text-[10px] text-muted-foreground">Appear in POS and Catalog</p>
                                </div>
                                <input name="isActive" type="checkbox" defaultChecked className="w-5 h-5 rounded-md accent-primary" />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-colors group">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-semibold text-foreground">Taxable product</span>
                                    <p className="text-[10px] text-muted-foreground">Standard tax rate applied</p>
                                </div>
                                <input name="taxable" type="checkbox" defaultChecked className="w-5 h-5 rounded-md accent-primary" />
                            </label>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Product
                        </h3>
                        <p className="text-xs text-muted-foreground">Make sure all details are correct before saving. You can edit this information later.</p>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Publish Product
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium hover:text-foreground hover:bg-muted transition-colors"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
