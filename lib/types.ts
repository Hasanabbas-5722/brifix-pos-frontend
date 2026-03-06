export type ProductCategory =
    | "all"
    | "beverages"
    | "food"
    | "electronics"
    | "clothing"
    | "accessories"
    | "health"
    | "stationery";

export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    category: ProductCategory;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    unit: string;
    image: string;
    description: string;
    isActive: boolean;
    taxable: boolean;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
    discount: number;
    discountType: "percentage" | "fixed";
    note: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    loyaltyPoints: number;
    totalSpent: number;
    totalOrders: number;
    createdAt: string;
    lastVisit: string;
    avatar: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    customer: Customer | null;
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: "cash" | "card" | "qr" | "split";
    paymentStatus: "paid" | "pending" | "refunded" | "partial";
    status: "completed" | "pending" | "cancelled" | "refunded";
    cashier: string;
    createdAt: string;
    note: string;
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "cashier";
    pin: string;
    isActive: boolean;
    createdAt: string;
    avatar: string;
    lastLogin: string;
}

export interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    productsCount: number;
    createdAt: string;
}

export interface InventoryAdjustment {
    id: string;
    product: Pick<Product, "id" | "name" | "sku">;
    type: "add" | "remove" | "adjustment";
    quantity: number;
    reason: string;
    createdAt: string;
    createdBy: string;
}

export interface SalesData {
    date: string;
    revenue: number;
    orders: number;
    avgOrderValue: number;
}

export interface StoreSettings {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    taxRate: number;
    currency: string;
    receiptFooter: string;
    timezone: string;
}
