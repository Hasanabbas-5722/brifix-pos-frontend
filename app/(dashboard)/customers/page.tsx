"use client";

import { useState } from "react";
import { Mail, Phone, Plus, Search, Star, TrendingUp, Users, X } from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Customer } from "@/lib/types";
import { customersApi } from "@/lib/api/apis";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [showAdd, setShowAdd] = useState(false);

    const handleFormSuccess = () => {
        setShowAdd(false);
        setEditCustomer(null);
        setSelectedCustomer(null);
        loadCustomers();
    };

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await customersApi.getAll();
            setCustomers(data || []);
        } catch (err) {
            console.error("Failed to load customers", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    });

    const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total Customers", value: customers.length, icon: Users, color: "text-blue-400" },
                    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Avg Spent", value: formatCurrency(customers.length ? totalRevenue / customers.length : 0), icon: TrendingUp, color: "text-violet-400" },
                    { label: "Total Points", value: totalPoints.toLocaleString(), icon: Star, color: "text-amber-400" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-3 md:p-4">
                            <Icon className={`w-4 h-4 ${s.color} mb-1.5`} />
                            <p className={`text-lg md:text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 focus-within:border-primary transition-all">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                    />
                    {search && <button onClick={() => setSearch("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Customer</span>
                </button>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filtered.map((customer) => (
                    <button
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="bg-card border border-border rounded-xl p-4 md:p-5 text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group"
                    >
                        <div className="flex items-start gap-3 mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                {customer.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground text-sm">{customer.name}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 flex-shrink-0">
                                <Star className="w-3 h-3" />
                                <span className="text-xs font-semibold">{customer.loyaltyPoints.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                            <div className="text-center">
                                <p className="text-base font-bold text-foreground">{customer.totalOrders}</p>
                                <p className="text-[10px] text-muted-foreground">Orders</p>
                            </div>
                            <div className="text-center border-x border-border">
                                <p className="text-base font-bold text-primary">{formatCurrency(customer.totalSpent)}</p>
                                <p className="text-[10px] text-muted-foreground">Spent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-foreground">{formatDate(customer.lastVisit)}</p>
                                <p className="text-[10px] text-muted-foreground">Last Visit</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="font-semibold text-foreground">No customers found</p>
                </div>
            )}

            {selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onEdit={(c) => { setEditCustomer(c); setSelectedCustomer(null); }}
                    onDeleteSuccess={handleFormSuccess}
                />
            )}
            {(showAdd || editCustomer) && (
                <CustomerFormModal
                    customer={editCustomer}
                    onClose={() => { setShowAdd(false); setEditCustomer(null); }}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}

interface CustomerDetailModalProps {
    customer: Customer;
    onClose: () => void;
    onEdit: (c: Customer) => void;
    onDeleteSuccess: () => void;
}

function CustomerDetailModal({ customer, onClose, onEdit, onDeleteSuccess }: CustomerDetailModalProps) {
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
            try {
                await customersApi.delete(customer.id);
                onDeleteSuccess();
            } catch (err) {
                alert("Failed to delete customer.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-in sm:animate-fade-in overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-bold text-foreground">Customer Details</h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                            {customer.avatar}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-foreground">{customer.name}</h3>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total Orders", value: customer.totalOrders, color: "text-blue-400" },
                            { label: "Total Spent", value: formatCurrency(customer.totalSpent), color: "text-primary" },
                            { label: "Points", value: customer.loyaltyPoints, color: "text-amber-400" },
                        ].map((s) => (
                            <div key={s.label} className="text-center p-3 rounded-xl bg-muted/30">
                                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-sm">
                        {[
                            { label: "Member Since", value: formatDate(customer.createdAt) },
                            { label: "Last Visit", value: formatDate(customer.lastVisit) },
                            { label: "Address", value: customer.address },
                            { label: "GST Number", value: customer.gstNumber || "Not provided" },
                        ].map((row) => (
                            <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0">
                                <span className="text-muted-foreground">{row.label}</span>
                                <span className="text-foreground text-right max-w-[55%]">{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/20">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold text-foreground">Loyalty Points</span>
                            </div>
                            <span className="text-lg font-bold text-amber-400">{customer.loyaltyPoints}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min((customer.loyaltyPoints / 5000) * 100, 100)}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{Math.max(0, 5000 - customer.loyaltyPoints)} points to Gold status</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => onEdit(customer)}
                            className="flex-1 py-2.5 rounded-xl border border-border text-sm text-foreground hover:bg-muted transition-colors font-medium">
                            Edit Profile
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 py-2.5 rounded-xl border border-red-400/20 text-sm text-red-400 hover:bg-red-400/10 transition-colors font-medium">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CustomerFormModal({ customer, onClose, onSuccess }: { customer: Customer | null; onClose: () => void; onSuccess: () => void }) {
    const isEdit = !!customer;
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            gstNumber: formData.get("gstNumber") as string,
            avatar: (formData.get("name") as string)?.charAt(0).toUpperCase() || "C",
        };

        try {
            if (isEdit && customer?.id) {
                await customersApi.update(customer.id, payload);
            } else {
                await customersApi.create(payload);
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("Failed to save customer.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-in sm:animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h2 className="font-bold text-foreground">{isEdit ? "Edit Customer" : "Add Customer"}</h2>
                        <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
                            <input name="name" required defaultValue={customer?.name} placeholder="John Doe" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address *</label>
                            <input name="email" required type="email" defaultValue={customer?.email} placeholder="john@example.com" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone Number *</label>
                            <input name="phone" required type="tel" defaultValue={customer?.phone} placeholder="+1 (555) 000-0000" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
                            <input name="address" defaultValue={customer?.address} placeholder="123 Main St, City, State" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">GST Number (Optional)</label>
                            <input name="gstNumber" defaultValue={customer?.gstNumber} placeholder="22AAAAA0000A1Z5" className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono uppercase" />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-border mt-4">
                            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                            <button type="submit" disabled={isLoading} className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isEdit ? "Save Changes" : "Add Customer"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
