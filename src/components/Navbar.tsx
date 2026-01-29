// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    Star, LogOut, Home, BarChart3, Menu,
    CheckSquare, MessageSquare, HelpCircle,
    Image, BookOpen, Volume2, XCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Type for progress items (fixes "any" error)
interface ProgressItem {
    challenge: number;
    completed: boolean;
    score: number;
}

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [stars, setStars] = useState(0);
    const [loadingStars, setLoadingStars] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);



    // Get auth token when session changes
    useEffect(() => {
        if (!session?.user?.email) return;

        const getAuthToken = async () => {
            try {
                const res = await axios.post(
                    `${backendUrl}/api/users/get-or-create-token/`,
                    {
                        email: session.user.email,
                        username: session.user.name || session.user.email,
                    }
                );
                setAuthToken(res.data.token);
            } catch (err) {
                console.error("Failed to get token", err);
            }
        };

        getAuthToken();
    }, [session]);

    // Load stars when authToken is ready
    useEffect(() => {
        if (!authToken) return;

        const loadStars = async () => {
            setLoadingStars(true);
            try {
                const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
                    headers: { Authorization: `Token ${authToken}` },
                });
                // Type res.data as ProgressItem[]
                const completed = (res.data as ProgressItem[]).filter(p => p.completed).length;
                setStars(completed);
            } catch (err) {
                console.error("Failed to load stars", err);
            } finally {
                setLoadingStars(false);
            }
        };

        loadStars();
    }, [authToken]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    // Minimal navbar for not logged in
    if (!session) {
        return (
            <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold">SpeechFun Kids 🎤✨</div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push("/login")} className="hover:underline">
                            Login
                        </button>
                        <button
                            onClick={() => router.push("/register")}
                            className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                        >
                            Register
                        </button>
                    </div>
                </div>
            </nav>
        );
    }

    // Full navbar for logged-in users
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
            <div className="container mx-auto px-4 py-4">
                {/* Desktop */}
                <div className="hidden md:flex justify-between items-center">
                    <div className="text-2xl font-bold flex items-center gap-2">
                        SpeechFun Kids 🎤✨
                    </div>

                    <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.path}
                                onClick={() => router.push(tab.path)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap ${pathname === tab.path ? "bg-white/30 font-bold" : "hover:bg-white/20"
                                    }`}
                            >
                                <tab.icon size={20} />
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                            {loadingStars ? (
                                <span className="text-sm">...</span>
                            ) : (
                                <>
                                    <Star size={20} fill="gold" className="text-yellow-300" />
                                    <span className="font-bold">{stars}</span>
                                </>
                            )}
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

                {/* Mobile */}
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
