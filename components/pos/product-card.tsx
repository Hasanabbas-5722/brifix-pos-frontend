"use client";

import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/data";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem, items } = useCartStore();
    const [animating, setAnimating] = useState(false);
    const cartItem = items.find((i) => i.product.id === product.id);
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= product.minStock;

    const handleAdd = () => {
        if (isOutOfStock) return;
        addItem(product);
        setAnimating(true);
        setTimeout(() => setAnimating(false), 400);
    };

    return (
        <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={cn(
                "group relative flex flex-col rounded-xl border overflow-hidden text-left transition-all duration-200",
                isOutOfStock
                    ? "opacity-50 cursor-not-allowed border-border bg-card"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0",
                animating && "animate-scale-bounce"
            )}
        >
            {/* Image Area */}
            <div
                className="relative flex items-center justify-center h-24 sm:h-28 w-full text-4xl sm:text-5xl"
                style={{
                    background: `linear-gradient(135deg, ${CATEGORY_COLORS[product.category]}15, ${CATEGORY_COLORS[product.category]}30)`,
                }}
            >
                {product.image}

                {/* Cart quantity badge */}
                {cartItem && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white animate-fade-in">
                        {cartItem.quantity}
                    </div>
                )}

                {/* Category dot */}
                <div
                    className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full"
                    style={{ background: CATEGORY_COLORS[product.category] }}
                />

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-xs font-semibold text-muted-foreground bg-card/80 px-2 py-1 rounded-full border border-border">
                            Out of stock
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-2.5 flex flex-col gap-1 flex-1">
                <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{product.sku}</p>

                <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-sm font-bold text-foreground">
                        {formatCurrency(product.price)}
                    </span>
                    {isLowStock ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-400">
                            <AlertCircle className="w-3 h-3" />
                            {product.stock}
                        </span>
                    ) : (
                        <span className="text-[10px] text-muted-foreground">
                            {product.stock} {product.unit}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover add indicator */}
            {!isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                </div>
            )}
        </button>
    );
}
