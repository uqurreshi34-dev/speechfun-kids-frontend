// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Trophy, Target, TrendingUp, Star } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface ProgressItem {
    challenge: number;
    completed: boolean;
    score: number;
}

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [progress, setProgress] = useState<ProgressItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Get auth token
    useEffect(() => {
        if (!session?.user?.email) return;

        const getAuthToken = async () => {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/users/get-or-create-token/`,
                    {
                        email: session.user.email,
                        username: session.user.name || session.user.email,
                    }
                );
                setAuthToken(response.data.token);
            } catch (err) {
                console.error("Failed to get auth token", err);
            }
        };

        getAuthToken();
    }, [session?.user?.email, session?.user?.name]);

    // Load progress
    useEffect(() => {
        if (!authToken) return;

        const loadProgress = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
                    headers: { Authorization: `Token ${authToken}` },
                });
                setProgress(res.data);
            } catch (err) {
                console.error("Failed to load progress", err);
            } finally {
                setLoading(false);
            }
        };

        loadProgress();
    }, [authToken]);

    if (status === "loading" || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const totalChallenges = progress.length;
    const completedChallenges = progress.filter(p => p.completed).length;
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy size={40} />
                            <span className="text-3xl font-bold">{completedChallenges}</span>
                        </div>
                        <p className="text-lg">Stars Earned</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Target size={40} />
                            <span className="text-3xl font-bold">{totalChallenges}</span>
                        </div>
                        <p className="text-lg">Total Attempts</p>
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
                            <span className="text-3xl font-bold">{totalScore}</span>
                        </div>
                        <p className="text-lg">Total Points</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/80 p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">Overall Progress</h2>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all duration-500"
                            style={{ width: `${totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0}%` }}
                        >
                            {totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0}%
                        </div>
                    </div>
                    <p className="text-center mt-4 text-gray-600">
                        {completedChallenges} out of {totalChallenges} challenges completed!
                    </p>
                </div>

                {/* Motivational Message */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl text-center">
                    <p className="text-2xl font-bold text-purple-700">
                        {completedChallenges === 0 && "🚀 Start your journey! Complete your first challenge!"}
                        {completedChallenges > 0 && completedChallenges < 5 && "🌟 Great start! Keep going!"}
                        {completedChallenges >= 5 && completedChallenges < 10 && "🔥 You're on fire! Amazing progress!"}
                        {completedChallenges >= 10 && "👑 You're a speech champion! Keep it up!"}
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
