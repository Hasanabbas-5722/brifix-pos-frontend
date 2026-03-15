"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Store, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api/apis";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });

            if (response.status === "success" && response.data.access_token) {
                // Save token to localStorage to be attached to future requests
                localStorage.setItem("accessToken", response.data.access_token);
                localStorage.setItem("refreshToken", response.data.refresh_token);
                // Can also store user info 
                localStorage.setItem("user", JSON.stringify(response.data.user));

                router.push("/dashboard");
            } else {
                setError(response.message || "Invalid credentials");
            }
        } catch (err: any) {
            setError(err.message || "Failed to connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail("admin@brifix.com");
        setPassword("admin123");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
            {/* dynamic background blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] pointer-events-none mix-blend-screen" />

            <div className="z-10 w-full max-w-md px-4">
                <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4 shadow-xl shadow-primary/20 ring-1 ring-primary/20">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to BriFix</h1>
                    <p className="text-muted-foreground mt-2">Sign in to your point of sale system</p>
                </div>

                <div
                    className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl animate-fade-in relative overflow-hidden ring-1 ring-white/5"
                    style={{ animationDelay: "200ms" }}
                >
                    {/* Decorative subtle top border */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground ml-1">Email or Username</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-medium text-foreground">Password</label>
                                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative group overflow-hidden rounded-xl bg-primary text-primary-foreground font-bold text-sm py-3.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                            <span className={cn(
                                "flex items-center justify-center gap-2 transition-all duration-200",
                                isLoading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                            )}>
                                Sign In
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {isLoading && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </span>
                            )}
                            {/* Shine effect */}
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                        </button>
                    </form>

                    <div className="mt-8 relative hidden sm:block">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-card px-2 text-muted-foreground">Or try the demo</span>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2 hidden sm:flex">
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="w-full py-2.5 rounded-xl border border-border/60 bg-muted/10 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                        >
                            Fill Demo Credentials
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
                    &copy; {new Date().getFullYear()} BriFix POS. All rights reserved.
                </p>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
