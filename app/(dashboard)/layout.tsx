"use client";

import { useState } from "react";
import { Sidebar, MobileSidebarDrawer } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/store/cart-store";
import { useEffect } from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const userJson = localStorage.getItem("user");
                if (userJson) {
                    const user = JSON.parse(userJson);
                    if (user.tenant_id) {
                        useCartStore.getState().setTenantId(user.tenant_id);
                    }
                }
            } catch (err) {
                console.error("Failed to sync tenant ID to cart", err);
            }
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile sidebar drawer */}
            <MobileSidebarDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
