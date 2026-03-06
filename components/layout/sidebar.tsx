"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Cog,
    Home,
    Package,
    ShoppingCart,
    Users,
    UserSquare2,
    Warehouse,
    X,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "POS / Sales", href: "/pos", icon: ShoppingCart, badge: "HOT" },
    { label: "Products", href: "/products", icon: Package },
    { label: "Inventory", href: "/inventory", icon: Warehouse },
    { label: "Orders", href: "/orders", icon: ClipboardList },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Staff", href: "/staff", icon: UserSquare2 },
    { label: "Settings", href: "/settings", icon: Cog },
];

interface SidebarProps {
    onClose?: () => void;
    isMobileOpen?: boolean;
}

export function Sidebar({ onClose, isMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const { sidebarCollapsed, toggleSidebar } = useUIStore();

    const isMobile = !!onClose;
    const isCollapsed = !isMobile && sidebarCollapsed;

    const SidebarContent = () => (
        <aside
            className={cn(
                "flex flex-col h-full bg-sidebar border-r border-border/30 transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-border/30 flex-shrink-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Zap className="w-4 h-4 text-white" />
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white tracking-tight">BriFix</p>
                        <p className="text-xs text-white/50 tracking-widest uppercase">POS</p>
                    </div>
                )}
                {/* Mobile close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                                isActive
                                    ? "bg-primary/20 text-white"
                                    : "text-white/50 hover:bg-white/5 hover:text-white"
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />
                            )}
                            <Icon
                                className={cn(
                                    "flex-shrink-0 w-5 h-5 transition-colors",
                                    isActive ? "text-primary" : "text-current"
                                )}
                            />
                            {!isCollapsed && (
                                <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                            )}
                            {!isCollapsed && item.badge && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/30 text-primary">
                                    {item.badge}
                                </span>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-border">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-border/30 flex-shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 px-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            AT
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">Alex Turner</p>
                            <p className="text-xs text-white/40 truncate">Admin</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                )}
                {/* Collapse toggle — desktop only */}
                {!onClose && (
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        title={sidebarCollapsed ? "Expand" : "Collapse"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <ChevronLeft className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </aside>
    );

    return <SidebarContent />;
}

/** Mobile drawer with backdrop overlay */
export function MobileSidebarDrawer({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}
            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out md:hidden",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar onClose={onClose} />
            </div>
        </>
    );
}
