"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
    Star, LogOut, Home, BarChart3, Menu,
    CheckSquare, MessageSquare, HelpCircle,
    Image, BookOpen, Volume2, XCircle, ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useStars } from "@/contexts/StarsContext";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
    const { stars, loading: loadingStars } = useStars();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
            if (desktopDropdownOpen && desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
                setDesktopDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen, desktopDropdownOpen]);

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

    const currentTab = tabs.find(tab => tab.path === pathname) || tabs[0];

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                {/* Desktop */}
                <div className="hidden md:flex justify-between items-center">
                    {/* Logo */}
                    <div className="text-xl lg:text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
                        SpeechFun Kids 🎤✨
                    </div>

                    {/* Dropdown Navigation */}
                    <div className="relative" ref={desktopDropdownRef}>
                        <button
                            onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition min-w-[200px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <currentTab.icon size={18} />
                                <span className="font-medium">{currentTab.name}</span>
                            </div>
                            <ChevronDown
                                size={18}
                                className={`transition-transform ${desktopDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {desktopDropdownOpen && (
                            <div className="absolute top-full mt-2 left-0 bg-white text-gray-800 rounded-lg shadow-2xl overflow-hidden min-w-[240px] border border-gray-200">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.path}
                                        onClick={() => {
                                            router.push(tab.path);
                                            setDesktopDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-gray-100 last:border-b-0 ${pathname === tab.path
                                            ? "bg-purple-50 text-purple-700 font-semibold"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        <span className="text-sm">{tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right side: Stars + Logout */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                            {loadingStars ? (
                                <span className="text-sm">...</span>
                            ) : (
                                <>
                                    <Star size={18} fill="gold" className="text-yellow-300" />
                                    <span className="font-bold text-sm lg:text-base">{stars}</span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition text-sm"
                        >
                            <LogOut size={16} />
                            <span className="hidden lg:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                    <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">SpeechFun Kids 🎤</div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1.5 rounded-lg">
                                <Star size={14} fill="gold" className="text-yellow-300" />
                                <span className="font-bold text-sm">{stars}</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 hover:bg-white/20 rounded-lg transition"
                            >
                                <Menu size={22} />
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div
                            ref={mobileMenuRef}
                            className="mt-3 bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200"
                        >
                            <div className="max-h-[70vh] overflow-y-auto">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.path}
                                        onClick={() => {
                                            router.push(tab.path);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-gray-100 last:border-b-0 ${pathname === tab.path
                                            ? "bg-purple-50 text-purple-700 font-semibold"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <tab.icon size={20} />
                                        <span className="text-sm">{tab.name}</span>
                                    </button>
                                ))}

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-red-600 hover:bg-red-50 transition border-t-2 border-gray-200"
                                >
                                    <LogOut size={20} />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
