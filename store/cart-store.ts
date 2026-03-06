import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Customer, Product } from "@/lib/types";
import { calculateDiscount, calculateTax } from "@/lib/utils";

interface CartStore {
    items: CartItem[];
    customer: Customer | null;
    globalDiscount: number;
    globalDiscountType: "percentage" | "fixed";
    taxRate: number;
    note: string;

    // Actions
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    updateItemDiscount: (productId: string, discount: number, type: "percentage" | "fixed") => void;
    updateItemNote: (productId: string, note: string) => void;
    setCustomer: (customer: Customer | null) => void;
    setGlobalDiscount: (discount: number, type: "percentage" | "fixed") => void;
    setNote: (note: string) => void;
    clearCart: () => void;

    // Computed getters
    getSubtotal: () => number;
    getDiscount: () => number;
    getTax: () => number;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            customer: null,
            globalDiscount: 0,
            globalDiscountType: "percentage",
            taxRate: 8.5,
            note: "",

            addItem: (product) => {
                const items = get().items;
                const existing = items.find((i) => i.product.id === product.id);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.product.id === product.id
                                ? { ...i, quantity: i.quantity + 1 }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                product,
                                quantity: 1,
                                discount: 0,
                                discountType: "percentage",
                                note: "",
                            },
                        ],
                    });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.product.id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.product.id === productId ? { ...i, quantity } : i
                    ),
                });
            },

            updateItemDiscount: (productId, discount, type) => {
                set({
                    items: get().items.map((i) =>
                        i.product.id === productId
                            ? { ...i, discount, discountType: type }
                            : i
                    ),
                });
            },

            updateItemNote: (productId, note) => {
                set({
                    items: get().items.map((i) =>
                        i.product.id === productId ? { ...i, note } : i
                    ),
                });
            },

            setCustomer: (customer) => set({ customer }),
            setGlobalDiscount: (discount, type) =>
                set({ globalDiscount: discount, globalDiscountType: type }),
            setNote: (note) => set({ note }),

            clearCart: () =>
                set({
                    items: [],
                    customer: null,
                    globalDiscount: 0,
                    globalDiscountType: "percentage",
                    note: "",
                }),

            getSubtotal: () => {
                return get().items.reduce((sum, item) => {
                    const itemDiscount = calculateDiscount(
                        item.product.price,
                        item.discount,
                        item.discountType
                    );
                    return sum + (item.product.price - itemDiscount) * item.quantity;
                }, 0);
            },

            getDiscount: () => {
                const { globalDiscount, globalDiscountType } = get();
                const subtotal = get().getSubtotal();
                if (!globalDiscount) return 0;
                return calculateDiscount(subtotal, globalDiscount, globalDiscountType);
            },

            getTax: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscount();
                const taxableAmount = subtotal - discount;
                return calculateTax(taxableAmount, get().taxRate);
            },

            getTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscount();
                const tax = get().getTax();
                return subtotal - discount + tax;
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        { name: "pos-cart" }
    )
);
