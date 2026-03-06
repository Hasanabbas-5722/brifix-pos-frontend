"use client";

import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useState } from "react";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/pos": "Point of Sale",
    "/products": "Products",
    "/inventory": "Inventory",
    "/orders": "Orders",
    "/customers": "Customers",
    "/reports": "Reports",
    "/staff": "Staff Management",
    "/settings": "Settings",
};

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    const title =
        Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
        "BriFix POS";

    return (
        <header className="h-14 md:h-16 flex items-center gap-2 md:gap-4 px-3 md:px-5 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 flex-shrink-0">
            {/* Hamburger (mobile) */}
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden flex-shrink-0"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <div className="flex-1 min-w-0">
                <h1 className="text-sm md:text-base font-semibold text-foreground truncate">
                    {title}
                </h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {/* Mobile search modal */}
            {searchOpen && (
                <div className="absolute inset-0 flex items-center px-3 bg-background/95 backdrop-blur-sm z-50 md:hidden">
                    <Search className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search..."
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                    <button onClick={() => setSearchOpen(false)} className="ml-2 p-1">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
            )}

            {/* Desktop search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border focus-within:border-primary transition-colors w-48 lg:w-64">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Quick search..."
                    className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
                />
                <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1 hidden lg:block">
                    ⌘K
                </kbd>
            </div>

            {/* Mobile search button */}
            <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden flex-shrink-0"
                aria-label="Search"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* Actions */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                </button>
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:bg-primary/30 transition-colors">
                    AT
                </div>
            </div>
        </header>
    );
}
