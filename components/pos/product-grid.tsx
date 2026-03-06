"use client";

import { useMemo } from "react";
import { PRODUCTS } from "@/lib/data";
import type { ProductCategory } from "@/lib/types";
import { ProductCard } from "@/components/pos/product-card";
import { Package } from "lucide-react";

interface ProductGridProps {
    search: string;
    category: ProductCategory;
}

export function ProductGrid({ search, category }: ProductGridProps) {
    const filtered = useMemo(() => {
        return PRODUCTS.filter((p) => {
            const matchesCategory = category === "all" || p.category === category;
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.barcode.includes(q) ||
                p.description.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    if (filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    {search
                        ? `No results for "${search}". Try a different search or category.`
                        : "No products in this category. Add products in the Products section."}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
