"use client";

import { useState } from "react";
import { Edit, Plus, Search, Shield, Trash2, User, UserCheck, UserX, X } from "lucide-react";
import { STAFF } from "@/lib/data";
import { cn, formatDateTime } from "@/lib/utils";
import type { StaffMember } from "@/lib/types";

const ROLE_STYLES: Record<string, string> = {
    admin: "bg-red-400/10 text-red-400",
    manager: "bg-amber-400/10 text-amber-400",
    cashier: "bg-blue-400/10 text-blue-400",
};

const PERMISSIONS: Record<string, string[]> = {
    admin: ["Full system access", "User management", "Reports & analytics", "Settings", "Inventory", "Refunds", "POS"],
    manager: ["Reports & analytics", "Inventory management", "Refunds", "POS", "Customer management"],
    cashier: ["POS sales", "View own orders", "Basic customer info"],
};

export default function StaffPage() {
    const [search, setSearch] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const filtered = STAFF.filter(
        (s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-4 md:space-y-5 animate-fade-in">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total", value: STAFF.length, icon: User, color: "text-blue-400" },
                    { label: "Active", value: STAFF.filter(s => s.isActive).length, icon: UserCheck, color: "text-emerald-400" },
                    { label: "Inactive", value: STAFF.filter(s => !s.isActive).length, icon: UserX, color: "text-red-400" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-card border border-border rounded-xl p-3 md:p-4 flex items-center gap-2 md:gap-3">
                            <Icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
                            <div>
                                <p className={`text-lg md:text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-muted/30 focus-within:border-primary transition-all">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0" />
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Staff</span>
                </button>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                {filtered.map((member) => (
                    <div key={member.id} className={cn("bg-card border border-border rounded-xl p-4 md:p-5 hover:border-primary/30 transition-all duration-200", !member.isActive && "opacity-60")}>
                        <div className="flex items-start gap-3 md:gap-4">
                            <div className="relative flex-shrink-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                    {member.avatar}
                                </div>
                                <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card", member.isActive ? "bg-emerald-400" : "bg-muted-foreground")} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-foreground text-sm">{member.name}</p>
                                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0", ROLE_STYLES[member.role])}>
                                        {member.role}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.email}</p>
                                <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
                                    Last login: {member.isActive ? formatDateTime(member.lastLogin) : "Inactive"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button onClick={() => setSelectedStaff(member)} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Permissions</p>
                            <div className="flex flex-wrap gap-1.5">
                                {PERMISSIONS[member.role].slice(0, 4).map((perm) => (
                                    <span key={perm} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">{perm}</span>
                                ))}
                                {PERMISSIONS[member.role].length > 4 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">+{PERMISSIONS[member.role].length - 4} more</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showAdd && <StaffFormModal onClose={() => setShowAdd(false)} />}
            {selectedStaff && <StaffFormModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />}
        </div>
    );
}

function StaffFormModal({ staff, onClose }: { staff?: StaffMember; onClose: () => void }) {
    const isEdit = !!staff;
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-in sm:animate-fade-in">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-bold text-foreground">{isEdit ? "Edit Staff Member" : "Add Staff Member"}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: "Full Name *", placeholder: "Jane Doe", defaultValue: staff?.name },
                        { label: "Email *", placeholder: "jane@store.com", type: "email", defaultValue: staff?.email },
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{f.label}</label>
                            <input type={f.type ?? "text"} defaultValue={f.defaultValue} placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary" />
                        </div>
                    ))}
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role *</label>
                        <select defaultValue={staff?.role ?? "cashier"} className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary">
                            <option value="admin">🔴 Admin</option>
                            <option value="manager">🟡 Manager</option>
                            <option value="cashier">🔵 Cashier</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">PIN (4 digits) *</label>
                        <input type="password" defaultValue={staff?.pin} placeholder="••••" maxLength={4} className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono text-center text-2xl tracking-widest" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={staff?.isActive ?? true} className="w-4 h-4 rounded accent-primary" />
                        <span className="text-sm text-foreground">Active Account</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                            {isEdit ? "Save Changes" : "Add Member"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
