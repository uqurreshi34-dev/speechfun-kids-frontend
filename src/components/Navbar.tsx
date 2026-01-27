// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Star, LogOut, Home, BarChart3 } from "lucide-react";

interface NavbarProps {
    totalStars: number;
}

export default function Navbar({ totalStars }: NavbarProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    if (!session) return null;

    return (
        <nav className="bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Left: Logo/Brand */}
                    <div className="text-2xl font-bold">
                        SpeechFun Kids! 🎤✨
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
            </div>
        </nav>
    );
}
