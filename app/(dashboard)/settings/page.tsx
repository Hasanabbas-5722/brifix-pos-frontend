"use client";

import { useState } from "react";
import {
    Bell,
    CreditCard,
    Percent,
    Printer,
    Save,
    Store,
    UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
    { id: "store", label: "Store", icon: Store },
    { id: "tax", label: "Tax", icon: Percent },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "receipt", label: "Receipt", icon: Printer },
    { id: "notifications", label: "Alerts", icon: Bell },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("store");
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-4 md:p-6 animate-fade-in">
            {/* Mobile: horizontal tab strip | Desktop: sidebar + content */}
            <div className="md:hidden mb-4">
                <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
                    {SETTINGS_TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all",
                                    activeTab === tab.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-6">
                {/* Desktop sidebar tabs */}
                <div className="hidden md:block w-44 flex-shrink-0">
                    <nav className="space-y-1">
                        {SETTINGS_TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all",
                                        activeTab === tab.id
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 max-w-2xl">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {activeTab === "store" && (
                            <SettingsSection title="Store Information" description="Basic store details shown on receipts and invoices">
                                <div className="space-y-4">
                                    <FormField label="Store Name" defaultValue="BriFix Express" placeholder="Store name" />
                                    <FormField label="Business Email" defaultValue="admin@brifix.com" type="email" />
                                    <FormField label="Phone Number" defaultValue="+1 (555) 100-2000" type="tel" />
                                    <FormField label="Address" defaultValue="100 Commerce Ave, New York, NY 10001" placeholder="Full address" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                                            <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary">
                                                <option>USD — US Dollar ($)</option>
                                                <option>EUR — Euro (€)</option>
                                                <option>GBP — British Pound (£)</option>
                                                <option>JPY — Japanese Yen (¥)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timezone</label>
                                            <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary">
                                                <option>America/New_York (EST)</option>
                                                <option>America/Los_Angeles (PST)</option>
                                                <option>Europe/London (GMT)</option>
                                                <option>Asia/Tokyo (JST)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "tax" && (
                            <SettingsSection title="Tax Configuration" description="Configure tax rates applied to sales transactions">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Default Tax Rate (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                defaultValue="8.5"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2.5 pr-8 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Tax Inclusive Pricing", desc: "Prices already include tax" },
                                            { label: "Show Tax on Receipt", desc: "Display tax breakdown on receipts" },
                                            { label: "Tax Exempt for Non-taxable Products", desc: "Auto-skip tax for non-taxable items" },
                                        ].map((item) => (
                                            <ToggleSetting key={item.label} label={item.label} desc={item.desc} defaultChecked />
                                        ))}
                                    </div>
                                    <FormField label="Tax ID / Registration Number" placeholder="e.g. 12-3456789" />
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "payment" && (
                            <SettingsSection title="Payment Methods" description="Enable or disable payment options at checkout">
                                <div className="space-y-3">
                                    {[
                                        { label: "💵 Cash Payments", desc: "Accept cash at the counter", enabled: true },
                                        { label: "💳 Card Payments", desc: "Credit/debit card via terminal", enabled: true },
                                        { label: "📱 QR / Digital Wallets", desc: "Apple Pay, Google Pay, WeChat", enabled: true },
                                        { label: "✂️ Split Payments", desc: "Allow paying with multiple methods", enabled: true },
                                        { label: "🪙 Loyalty Points", desc: "Let customers redeem loyalty points", enabled: false },
                                        { label: "💶 Store Credit", desc: "Accept store credit as payment", enabled: false },
                                    ].map((item) => (
                                        <ToggleSetting key={item.label} label={item.label} desc={item.desc} defaultChecked={item.enabled} />
                                    ))}
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "receipt" && (
                            <SettingsSection title="Receipt Settings" description="Customize how receipts look and what they include">
                                <div className="space-y-4">
                                    <FormField label="Receipt Header" defaultValue="BriFix Express" />
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Footer Message</label>
                                        <textarea
                                            rows={3}
                                            defaultValue="Thank you for your purchase! Visit us again."
                                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Show Logo", desc: "Display store logo on receipt", checked: true },
                                            { label: "Show Barcode", desc: "Order barcode on receipt", checked: true },
                                            { label: "Show QR Code", desc: "QR for digital receipt", checked: false },
                                            { label: "Auto Print", desc: "Automatically print after payment", checked: false },
                                            { label: "Email Receipt", desc: "Email receipt to customer", checked: true },
                                        ].map((item) => (
                                            <ToggleSetting key={item.label} label={item.label} desc={item.desc} defaultChecked={item.checked} />
                                        ))}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Paper Size</label>
                                        <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary">
                                            <option>80mm (Standard Thermal)</option>
                                            <option>58mm (Small Thermal)</option>
                                            <option>A4 (Full Page)</option>
                                        </select>
                                    </div>
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "notifications" && (
                            <SettingsSection title="Notification Preferences" description="Choose when and how you get notified">
                                <div className="space-y-3">
                                    {[
                                        { label: "Low Stock Alerts", desc: "Notify when stock falls below minimum", checked: true },
                                        { label: "Out of Stock Alerts", desc: "Immediate alert when product runs out", checked: true },
                                        { label: "Daily Sales Summary", desc: "End-of-day sales report email", checked: true },
                                        { label: "New Customer Registration", desc: "Alert when new customer signs up", checked: false },
                                        { label: "Large Transactions", desc: "Alert for transactions above $500", checked: true },
                                        { label: "Failed Payment Attempts", desc: "Notify on payment failures", checked: true },
                                        { label: "Refund Processed", desc: "Alert when a refund is issued", checked: false },
                                    ].map((item) => (
                                        <ToggleSetting key={item.label} label={item.label} desc={item.desc} defaultChecked={item.checked} />
                                    ))}
                                </div>
                            </SettingsSection>
                        )}

                        {/* Save Button */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={handleSave}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                                    saved
                                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                                )}
                            >
                                <Save className="w-4 h-4" />
                                {saved ? "Changes Saved!" : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <div>
            <div className="px-6 py-5 border-b border-border">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function FormField({ label, defaultValue, placeholder, type = "text" }: { label: string; defaultValue?: string; placeholder?: string; type?: string; }) {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                placeholder={placeholder ?? label}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
        </div>
    );
}

function ToggleSetting({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked: boolean; }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <button
                onClick={() => setChecked(!checked)}
                className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0",
                    checked ? "bg-primary" : "bg-muted"
                )}
            >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200", checked ? "left-5" : "left-0.5")} />
            </button>
        </div>
    );
}
