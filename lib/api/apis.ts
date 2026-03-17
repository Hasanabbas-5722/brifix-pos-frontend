import { fetchApi } from './client';
import { Customer, Order, Product, SalesData } from '../types';

// =======================
// AUTHENTICATION API
// =======================
export const authApi = {
    login: async (credentials: any) => {
        return fetchApi<any>("/auth/login", {
            method: "POST",
            body: credentials,
            requireAuth: false
        });
    },
    register: async (data: any) => {
        return fetchApi<any>("/auth/register", {
            method: "POST",
            body: data,
            requireAuth: false
        });
    }
};

// =======================
// PRODUCTS API
// =======================
export const productsApi = {
    getAll: async () => {
        const res = await fetchApi<{ status: string, data: Product[] }>("/products/", { method: "GET" });
        return res.data;
    },
    getOne: async (id: string) => {
        const res = await fetchApi<{ status: string, data: Product }>(`/products/${id}`, { method: "GET" });
        return res.data;
    },
    create: async (data: Partial<Product>) => {
        return fetchApi<{ status: string, data: Product, message: string }>("/products/", { method: "POST", body: data });
    },
    update: async (id: string, data: Partial<Product>) => {
        return fetchApi<any>(`/products/${id}`, { method: "PUT", body: data });
    },
    delete: async (id: string) => {
        return fetchApi<any>(`/products/${id}`, { method: "DELETE" });
    }
};

// =======================
// CUSTOMERS API
// =======================
export const customersApi = {
    getAll: async () => {
        const res = await fetchApi<{ status: string, data: Customer[] }>("/customers/", { method: "GET" });
        return res.data;
    },
    getOne: async (id: string) => {
        const res = await fetchApi<{ status: string, data: Customer }>(`/customers/${id}`, { method: "GET" });
        return res.data;
    },
    create: async (data: Partial<Customer>) => {
        return fetchApi<{ status: string, data: Customer, message: string }>("/customers/", { method: "POST", body: data });
    },
    update: async (id: string, data: Partial<Customer>) => {
        return fetchApi<any>(`/customers/${id}`, { method: "PUT", body: data });
    },
    delete: async (id: string) => {
        return fetchApi<any>(`/customers/${id}`, { method: "DELETE" });
    }
};

// =======================
// ORDERS API
// =======================
export const ordersApi = {
    getAll: async () => {
        const res = await fetchApi<{ status: string, data: Order[] }>("/orders/", { method: "GET" });
        return res.data;
    },
    getOne: async (id: string) => {
        const res = await fetchApi<{ status: string, data: Order }>(`/orders/${id}`, { method: "GET" });
        return res.data;
    },
    create: async (data: any) => {
        return fetchApi<{ status: string, data: Order, message: string }>("/orders/", { method: "POST", body: data });
    },
    update: async (id: string, data: Partial<Order>) => {
        return fetchApi<any>(`/orders/${id}`, { method: "PUT", body: data });
    },
    getSummary: async () => {
        const res = await fetchApi<{ status: string, data: any }>("/orders/summary", { method: "GET" });
        return res.data;
    }
};

// =======================
// INVENTORY API
// =======================
export const inventoryApi = {
    getAll: async () => {
        const res = await fetchApi<{ status: string, data: any[] }>("/inventory/");
        return res.data;
    },
    add: (data: { productId: string; quantity: number; reason?: string }) =>
        fetchApi("/inventory/add", { method: "POST", body: data }),
    getTransactions: async () => {
        const res = await fetchApi<{ status: string, data: any[] }>("/inventory/transactions");
        return res.data;
    },
};

// =======================
// DASHBOARD API
// =======================
export const dashboardApi = {
    getStats: async () => {
        const res = await fetchApi<{ status: string, data: any }>("/dashboard/stats", { method: "GET" });
        return res.data;
    }
};
// =======================
// CREDITS API
// =======================
export const creditsApi = {
    getCustomerSummary: async () => {
        const res = await fetchApi<{ status: string, data: any[] }>("/credits/customer-summary", { method: "GET" });
        return res.data;
    },
    getCustomerBills: async (customerId: string) => {
        const res = await fetchApi<{ status: string, data: any[] }>(`/credits/customer/${customerId}/bills`, { method: "GET" });
        return res.data;
    },
    getCustomerCredit: async (customerId: string) => {
        const res = await fetchApi<{ status: string, data: any }>(`/credits/customer/${customerId}`, { method: "GET" });
        return res.data;
    },
    getSummary: async () => {
        const res = await fetchApi<{ status: string, data: any }>("/credits/summary", { method: "GET" });
        return res.data;
    }
};

// =======================
// PAYMENTS API
// =======================
export const paymentsApi = {
    create: async (data: any) => {
        return fetchApi<{ status: string, data: any, message: string }>("/payments/", { method: "POST", body: data });
    },
    getCustomerPayments: async (customerId: string) => {
        const res = await fetchApi<{ status: string, data: any[] }>(`/payments/customer/${customerId}`, { method: "GET" });
        return res.data;
    }
};

// =======================
// SETTINGS API
// =======================
export const settingsApi = {
    get: async () => {
        const res = await fetchApi<{ status: string, data: any }>("/settings/", { method: "GET" });
        return res.data;
    },
    update: async (data: any) => {
        return fetchApi<{ status: string, message: string }>("/settings/", { method: "POST", body: data });
    }
};

// =======================
// SYSTEM API
// =======================
export const systemApi = {
    getHealth: async () => {
        const res = await fetchApi<any>("/health", { method: "GET", requireAuth: false });
        return res;
    }
};
