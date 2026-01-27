// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Star, LogOut, Home, BarChart3, Menu } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
    totalStars: number;
}

export default function Navbar({ totalStars }: NavbarProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!session) return null;

    return (
        <nav className="bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                {/* Desktop View */}
                <div className="hidden md:flex justify-between items-center">
                    {/* Left: Logo/Brand */}
                    <div className="text-2xl font-bold">
                        SpeechFun Kids 🎤✨
                    </div>

                    {/* Middle: Navigation */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${pathname === "/"
                                ? "bg-white/30 font-bold"
                                : "hover:bg-white/20"
                                }`}
                        >
                            <Home size={20} />
                            Challenges
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${pathname === "/dashboard"
                                ? "bg-white/30 font-bold"
                                : "hover:bg-white/20"
                                }`}
                        >
                            <BarChart3 size={20} />
                            Dashboard
                        </button>
                    </div>

                    {/* Right: User Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                            <Star size={20} fill="gold" className="text-yellow-300" />
                            <span className="font-bold">{totalStars}</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold"> SpeechFun Kids 🎤✨</div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                <Star size={16} fill="gold" className="text-yellow-300" />
                                <span className="font-bold text-sm">{totalStars}</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 hover:bg-white/20 rounded-lg transition"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={() => {
                                    router.push("/");
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${pathname === "/"
                                    ? "bg-white/30 font-bold"
                                    : "hover:bg-white/20"
                                    }`}
                            >
                                <Home size={20} />
                                Challenges
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/dashboard");
                                    setMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition ${pathname === "/dashboard"
                                    ? "bg-white/30 font-bold"
                                    : "hover:bg-white/20"
                                    }`}
                            >
                                <BarChart3 size={20} />
                                Dashboard
                            </button>
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg transition"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
