//components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    Star, LogOut, Home, BarChart3, Menu,
    CheckSquare, MessageSquare, HelpCircle,
    Image, BookOpen, Volume2, XCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStars } from "@/contexts/StarsContext";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { stars, loading: loadingStars } = useStars();
    const menuRef = useRef<HTMLDivElement>(null);
    // test me
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    if (!session) {
        return null;
    }

    const tabs = [
        { name: "Challenges", path: "/", icon: Home },
        { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
        { name: "Yes/No Lab", path: "/yes-no", icon: CheckSquare },
        { name: "Functional Language", path: "/functional-language-builder", icon: MessageSquare },
        { name: "WH Explorer", path: "/wh-explorer", icon: HelpCircle },
        { name: "Chatter Pics", path: "/chatter-pics", icon: Image },
        { name: "Story Builder", path: "/story-builder", icon: BookOpen },
        { name: "Sound it Out", path: "/sound-it-out", icon: Volume2 },
        { name: "What Does Not Belong", path: "/what-not-belong", icon: XCircle },
    ];

    return (
        <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3"> {/* Reduced py-4 → py-3 for compactness */}
                {/* Desktop */}
                <div className="hidden md:flex justify-between items-center">
                    <div className="text-2xl font-bold flex items-center gap-2">
                        SpeechFun Kids 🎤✨
                    </div>

                    {/* Tabs: Wrap instead of scroll */}
                    <div className="flex flex-wrap gap-3 lg:gap-4 items-center justify-center"> {/* ← Key change: flex-wrap + reduced gap */}
                        {tabs.map((tab) => (
                            <button
                                key={tab.path}
                                onClick={() => router.push(tab.path)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap text-sm lg:text-base
                  ${pathname === tab.path
                                        ? "bg-white/30 font-semibold shadow-sm"
                                        : "hover:bg-white/20 hover:shadow-sm"
                                    }`}
                            >
                                <tab.icon size={18} className="lg:size-20" /> {/* Smaller icons */}
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm lg:text-base">
                            {loadingStars ? (
                                <span>...</span>
                            ) : (
                                <>
                                    <Star size={18} fill="gold" className="text-yellow-300" />
                                    <span className="font-bold">{stars}</span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm lg:text-base"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile – unchanged */}
                <div className="md:hidden">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold">SpeechFun Kids 🎤✨</div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                                <Star size={16} fill="gold" className="text-yellow-300" />
                                <span className="font-bold text-sm">{stars}</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 hover:bg-white/20 rounded-lg transition"
                            >
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div
                            ref={menuRef}
                            className="mt-3 bg-white/95 backdrop-blur-md text-purple-900 rounded-2xl shadow-2xl border border-purple-200/50 overflow-hidden max-w-md mx-auto"
                        >
                            <div className="py-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.path}
                                        onClick={() => {
                                            router.push(tab.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition border-b border-purple-100 ${pathname === tab.path ? "bg-purple-100/70 font-semibold" : "hover:bg-purple-50"
                                            }`}
                                    >
                                        <tab.icon size={22} />
                                        {tab.name}
                                    </button>
                                ))}

                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: "/" });
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-5 py-4 text-left text-red-600 hover:bg-red-50 transition border-t border-purple-100"
                                >
                                    <LogOut size={22} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
