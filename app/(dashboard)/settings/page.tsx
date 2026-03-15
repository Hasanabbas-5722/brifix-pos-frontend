"use client";

import { useEffect, useState } from "react";
import {
    Bell,
    CreditCard,
    Percent,
    Printer,
    Save,
    Store,
    UserCheck,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { settingsApi } from "@/lib/api/apis";

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsApi.get();
                setSettings(data);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsApi.update(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (section: string, key: string, value: any) => {
        setSettings((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings) return null;

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
                                    <FormField
                                        label="Store Name"
                                        value={settings.store.name}
                                        onChange={(v) => updateSetting("store", "name", v)}
                                        placeholder="Store name"
                                    />
                                    <FormField
                                        label="Business Email"
                                        value={settings.store.email}
                                        onChange={(v) => updateSetting("store", "email", v)}
                                        type="email"
                                    />
                                    <FormField
                                        label="Phone Number"
                                        value={settings.store.phone}
                                        onChange={(v) => updateSetting("store", "phone", v)}
                                        type="tel"
                                    />
                                    <FormField
                                        label="Address"
                                        value={settings.store.address}
                                        onChange={(v) => updateSetting("store", "address", v)}
                                        placeholder="Full address"
                                    />
                                    <div className="pt-4 mt-4 border-t border-border">
                                        <ToggleSetting
                                            label="🏪 Parlour Mode"
                                            desc="Enable specialized features for parlour-style businesses (e.g., quick tea billing)"
                                            checked={settings.store.parlour}
                                            onChange={(v) => updateSetting("store", "parlour", v)}
                                        />
                                    </div>

                                    {settings.store.parlour && (
                                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in zoom-in-95">
                                            <FormField
                                                label="Full Tea Price"
                                                value={settings.store.tea_full_price || 15}
                                                onChange={(v) => updateSetting("store", "tea_full_price", v)}
                                                type="number"
                                            />
                                            <FormField
                                                label="Half Tea Price"
                                                value={settings.store.tea_half_price || 10}
                                                onChange={(v) => updateSetting("store", "tea_half_price", v)}
                                                type="number"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                                            <select 
                                                value={settings.store.currency}
                                                onChange={(e) => updateSetting("store", "currency", e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                            >
                                                <option>USD — US Dollar ($)</option>
                                                <option>EUR — Euro (€)</option>
                                                <option>GBP — British Pound (£)</option>
                                                <option>JPY — Japanese Yen (¥)</option>
                                            </select>
                                        </div> */}
                                        {/* <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Timezone</label>
                                            <select
                                                value={settings.store.timezone}
                                                onChange={(e) => updateSetting("store", "timezone", e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                            >
                                                <option>America/New_York (EST)</option>
                                                <option>America/Los_Angeles (PST)</option>
                                                <option>Europe/London (GMT)</option>
                                                <option>Asia/Tokyo (JST)</option>
                                            </select>
                                        </div> */}
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
                                                value={settings.tax.rate}
                                                onChange={(e) => updateSetting("tax", "rate", parseFloat(e.target.value))}
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2.5 pr-8 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <ToggleSetting
                                            label="Tax Inclusive Pricing"
                                            desc="Prices already include tax"
                                            checked={settings.tax.inclusive}
                                            onChange={(v) => updateSetting("tax", "inclusive", v)}
                                        />
                                        <ToggleSetting
                                            label="Show Tax on Receipt"
                                            desc="Display tax breakdown on receipts"
                                            checked={settings.tax.showOnReceipt}
                                            onChange={(v) => updateSetting("tax", "showOnReceipt", v)}
                                        />
                                        <ToggleSetting
                                            label="Tax Exempt for Non-taxable Products"
                                            desc="Auto-skip tax for non-taxable items"
                                            checked={settings.tax.taxExemptNonTaxable}
                                            onChange={(v) => updateSetting("tax", "taxExemptNonTaxable", v)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company GST Number / Tax ID</label>
                                        <input
                                            value={settings.tax.gstNumber}
                                            onChange={(e) => updateSetting("tax", "gstNumber", e.target.value)}
                                            placeholder="e.g. 22AAAAA0000A1Z5"
                                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary font-mono uppercase"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1.5 italic">Note: Tax will only be calculated if this or the customer's GST is provided.</p>
                                    </div>
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "payment" && (
                            <SettingsSection title="Payment Methods" description="Enable or disable payment options at checkout">
                                <div className="space-y-3">
                                    <ToggleSetting
                                        label="💵 Cash Payments"
                                        desc="Accept cash at the counter"
                                        checked={settings.payment.cash}
                                        onChange={(v) => updateSetting("payment", "cash", v)}
                                    />
                                    <ToggleSetting
                                        label="💳 Card Payments"
                                        desc="Credit/debit card via terminal"
                                        checked={settings.payment.card}
                                        onChange={(v) => updateSetting("payment", "card", v)}
                                    />
                                    <ToggleSetting
                                        label="📱 QR / Digital Wallets"
                                        desc="Apple Pay, Google Pay, WeChat"
                                        checked={settings.payment.qr}
                                        onChange={(v) => updateSetting("payment", "qr", v)}
                                    />
                                    <ToggleSetting
                                        label="✂️ Split Payments"
                                        desc="Allow paying with multiple methods"
                                        checked={settings.payment.split}
                                        onChange={(v) => updateSetting("payment", "split", v)}
                                    />
                                    <ToggleSetting
                                        label="🪙 Loyalty Points"
                                        desc="Let customers redeem loyalty points"
                                        checked={settings.payment.loyalty}
                                        onChange={(v) => updateSetting("payment", "loyalty", v)}
                                    />
                                    <ToggleSetting
                                        label="💶 Store Credit"
                                        desc="Accept store credit as payment"
                                        checked={settings.payment.storeCredit}
                                        onChange={(v) => updateSetting("payment", "storeCredit", v)}
                                    />
                                    <div className="pt-4 mt-4 border-t border-border">
                                        <ToggleSetting
                                            label="📂 Credit Management System"
                                            desc="Enable advanced tracking for customer dues and partial payments"
                                            checked={settings.payment.credit_system}
                                            onChange={(v) => updateSetting("payment", "credit_system", v)}
                                        />
                                    </div>
                                </div>
                            </SettingsSection>
                        )}

                        {activeTab === "receipt" && (
                            <SettingsSection title="Receipt Settings" description="Customize how receipts look and what they include">
                                <div className="space-y-4">
                                    <FormField
                                        label="Receipt Header"
                                        value={settings.receipt.header}
                                        onChange={(v) => updateSetting("receipt", "header", v)}
                                    />
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Footer Message</label>
                                        <textarea
                                            rows={3}
                                            value={settings.receipt.footer}
                                            onChange={(e) => updateSetting("receipt", "footer", e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary resize-none"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <ToggleSetting
                                            label="Show Logo"
                                            desc="Display store logo on receipt"
                                            checked={settings.receipt.showLogo}
                                            onChange={(v) => updateSetting("receipt", "showLogo", v)}
                                        />
                                        <ToggleSetting
                                            label="Show Barcode"
                                            desc="Order barcode on receipt"
                                            checked={settings.receipt.showBarcode}
                                            onChange={(v) => updateSetting("receipt", "showBarcode", v)}
                                        />
                                        <ToggleSetting
                                            label="Show QR Code"
                                            desc="QR for digital receipt"
                                            checked={settings.receipt.showQr}
                                            onChange={(v) => updateSetting("receipt", "showQr", v)}
                                        />
                                        <ToggleSetting
                                            label="Auto Print"
                                            desc="Automatically print after payment"
                                            checked={settings.receipt.autoPrint}
                                            onChange={(v) => updateSetting("receipt", "autoPrint", v)}
                                        />
                                        <ToggleSetting
                                            label="Email Receipt"
                                            desc="Email receipt to customer"
                                            checked={settings.receipt.emailReceipt}
                                            onChange={(v) => updateSetting("receipt", "emailReceipt", v)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Paper Size</label>
                                        <select
                                            value={settings.receipt.paperSize}
                                            onChange={(e) => updateSetting("receipt", "paperSize", e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary"
                                        >
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
                                    <ToggleSetting
                                        label="Low Stock Alerts"
                                        desc="Notify when stock falls below minimum"
                                        checked={settings.notifications.lowStock}
                                        onChange={(v) => updateSetting("notifications", "lowStock", v)}
                                    />
                                    <ToggleSetting
                                        label="Out of Stock Alerts"
                                        desc="Immediate alert when product runs out"
                                        checked={settings.notifications.outOfStock}
                                        onChange={(v) => updateSetting("notifications", "outOfStock", v)}
                                    />
                                    <ToggleSetting
                                        label="Daily Sales Summary"
                                        desc="End-of-day sales report email"
                                        checked={settings.notifications.dailySummary}
                                        onChange={(v) => updateSetting("notifications", "dailySummary", v)}
                                    />
                                    <ToggleSetting
                                        label="New Customer Registration"
                                        desc="Alert when new customer signs up"
                                        checked={settings.notifications.newCustomer}
                                        onChange={(v) => updateSetting("notifications", "newCustomer", v)}
                                    />
                                    <ToggleSetting
                                        label="Large Transactions"
                                        desc="Alert for transactions above $500"
                                        checked={settings.notifications.largeTransactions}
                                        onChange={(v) => updateSetting("notifications", "largeTransactions", v)}
                                    />
                                    <ToggleSetting
                                        label="Failed Payment Attempts"
                                        desc="Notify on payment failures"
                                        checked={settings.notifications.failedPayments}
                                        onChange={(v) => updateSetting("notifications", "failedPayments", v)}
                                    />
                                    <ToggleSetting
                                        label="Refund Processed"
                                        desc="Alert when a refund is issued"
                                        checked={settings.notifications.refunds}
                                        onChange={(v) => updateSetting("notifications", "refunds", v)}
                                    />
                                </div>
                            </SettingsSection>
                        )}

                        {/* Save Button */}
                        <div className="px-6 pb-6">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
                                    saved
                                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                                    saving && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saved ? "Changes Saved!" : saving ? "Saving..." : "Save Settings"}
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

function FormField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; }) {
    return (
        <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? label}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
            />
        </div>
    );
}

function ToggleSetting({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
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
