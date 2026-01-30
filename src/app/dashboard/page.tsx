// app/dashboard/page.tsx
"use client";

import { useEffect } from "react"; // ← reduced imports (no useState needed anymore)
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Star } from "lucide-react";
import { useStars } from "@/contexts/StarsContext"; // ← NEW IMPORT

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // ── NEW: Use global StarsContext
    const { stars: totalStars, completedChallenges, loading: starsLoading, refreshStars } = useStars();

    // Redirect if not logged in (unchanged)
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // NEW: Refresh progress/stars when session is ready (optional but good for dashboard freshness)
    useEffect(() => {
        if (status === "authenticated") {
            refreshStars(); // ← pulls latest from backend via context
        }
    }, [status, refreshStars]);

    // Removed: local progress state, authToken state, token fetching useEffect, progress loading useEffect
    //   → all now handled in StarsProvider + refreshStars()

    if (status === "loading" || starsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    // Changed: Calculate stats from context Set instead of local array
    const totalChallenges = completedChallenges.size; // assuming every completed challenge counts as 1 attempt
    const completedCount = completedChallenges.size; // same as totalStars in this context
    // If you need total attempts (including incomplete), you'd need backend to return full progress list
    // For now we keep your logic close: use completed as proxy for attempts if incomplete aren't tracked
    const totalScore = totalStars * 100; // assuming 100 points per star (matches your old score:100)
    const averageScore = totalChallenges > 0 ? Math.round(totalScore / totalChallenges) : 0;

    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">
                    Your Progress Dashboard 📊
                </h1>

                {/* Stats Grid – updated values from context */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy size={40} />
                            <span className="text-3xl font-bold">{completedCount}</span> {/* ← from context */}
                        </div>
                        <p className="text-lg">Stars Earned</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Target size={40} />
                            <span className="text-3xl font-bold">{totalChallenges}</span> {/* ← from context size */}
                        </div>
                        <p className="text-lg">Total Challenges</p> {/* adjusted label for clarity */}
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={40} />
                            <span className="text-3xl font-bold">{averageScore}%</span>
                        </div>
                        <p className="text-lg">Avg Score</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Star size={40} fill="white" />
                            <span className="text-3xl font-bold">{totalScore}</span> {/* ← calculated */}
                        </div>
                        <p className="text-lg">Total Points</p>
                    </div>
                </div>

                {/* Progress Bar – uses context values */}
                <div className="bg-white/80 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">Overall Progress</h2>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500"
                            style={{ width: `${totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0}%` }}
                        >
                            {totalChallenges > 0 ? Math.round((completedCount / totalChallenges) * 100) : 0}%
                        </div>
                    </div>
                    <p className="text-center mt-4 text-gray-600">
                        {completedCount} out of {totalChallenges} challenges completed!
                    </p>
                </div>

                {/* Motivational Message – updated variable name */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-purple-700">
                        {completedCount === 0 && "🚀 Start your journey! Complete your first challenge!"}
                        {completedCount > 0 && completedCount < 5 && "🌟 Great start! Keep going!"}
                        {completedCount >= 5 && completedCount < 10 && "🔥 You're on fire! Amazing progress!"}
                        {completedCount >= 10 && "👑 You're a speech champion! Keep it up!"}
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
