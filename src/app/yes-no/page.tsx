// app/yes-no/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { useStars } from "@/contexts/StarsContext"; // ← Add this import
import Navbar from "@/components/Navbar"; // ← Add navbar

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface YesNoQuestion {
    id: number;
    scene_description: string;
    question: string;
    correct_answer: string;
    visual_url: string | null;
}

export default function YesNoLab() {
    const [questions, setQuestions] = useState<YesNoQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | "already_done" | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const [authToken, setAuthToken] = useState<string | null>(null);

    // ← Use context instead of local state!
    const { stars, completedChallenges, addStar } = useStars();

    // Get or create Django auth token
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

                const token = response.data.token;
                setAuthToken(token);
                console.log("Auth token obtained:", token);
            } catch (err) {
                console.error("Failed to get auth token", err);
            }
        };

        getAuthToken();
    }, [session?.user?.email, session?.user?.name]);

    // Fetch questions
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/challenges/yes-no-questions/`);
                setQuestions(res.data);
                if (res.data.length === 0) {
                    setError("No Yes/No questions available yet.");
                }
            } catch (err) {
                console.error("Failed to load questions:", err);
                setError("Couldn't load questions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Simplified handleEarnStar using context
    const handleEarnStar = async (challengeId: number): Promise<boolean> => {
        if (!authToken) {
            alert("Auth still loading...");
            return false;
        }

        try {
            await axios.post(
                `${backendUrl}/api/challenges/progress/update/`,
                { challenge: challengeId, completed: true, score: 100 },
                { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
            );

            addStar(challengeId); // ← Update global state!
            return true;
        } catch (err) {
            console.error("Progress update failed", err);
            alert("Failed to save star.");
            return false;
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
                <p className="ml-4 text-xl text-purple-600">Loading fun questions...</p>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return (
            <>
                <Navbar />
                <main className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold text-purple-700 mb-8">Yes/No Lab</h1>
                    <p className="text-xl text-gray-700">{error || "No questions yet — check back soon! 🎈"}</p>
                </main>
            </>
        );
    }

    const current = questions[currentIndex];
    const isCompleted = completedChallenges.has(current.id);

    const handleAnswer = async (chosen: "Yes" | "No") => {
        if (isCompleted) {
            setFeedback("already_done");
            setTimeout(() => setFeedback(null), 1800);
            return;
        }

        const isCorrect = chosen === current.correct_answer;

        if (isCorrect) {
            setFeedback("correct");

            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#a78bfa", "#ec4899", "#60a5fa", "#fbbf24", "#34d399"],
            });

            const success = await handleEarnStar(current.id);
            if (success) {
                setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % questions.length);
                    setFeedback(null);
                }, 2200);
            }
        } else {
            setFeedback("incorrect");
            setTimeout(() => setFeedback(null), 1800);
        }
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        setFeedback(null);
    };

    return (
        <>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
                <h1 className="text-4xl sm:text-5xl font-black text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    Yes / No Lab 🎈
                </h1>

                <div className="text-center mb-6">
                    <p className="text-xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                        <Star size={24} fill="gold" className="text-yellow-500" />
                        Stars: {stars}
                    </p>
                </div>

                <div className="bg-white/85 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl border-4 border-purple-200 max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
                            className="space-y-8"
                        >
                            {/* Visual */}
                            <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl overflow-hidden border-4 border-purple-100 shadow-inner">
                                {current.visual_url ? (
                                    current.visual_url.endsWith('.mp4') ? (
                                        <video
                                            src={current.visual_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={current.visual_url}
                                            alt={current.scene_description || "Visual scene"}
                                            fill
                                            className="object-cover rounded-2xl"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                                            priority={currentIndex < 3}
                                        />
                                    )
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-lg sm:text-xl font-medium">
                                        [Visual: {current.scene_description}]
                                    </div>
                                )}
                            </div>

                            {/* Question with permanent star if completed */}
                            <div className="flex items-center justify-center gap-4">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-indigo-700 leading-tight">
                                    {current.question}
                                </h2>
                                {isCompleted && (
                                    <Star size={36} fill="gold" className="text-yellow-500 animate-pulse" />
                                )}
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`text-center text-3xl sm:text-4xl font-extrabold py-4 ${feedback === "correct" ? "text-green-600" :
                                            feedback === "incorrect" ? "text-red-600" :
                                                "text-blue-600"
                                            }`}
                                    >
                                        {feedback === "correct" ? "Yay! Correct! 🎉⭐" :
                                            feedback === "incorrect" ? "Oops! Try again! 😊" :
                                                "Already completed! 🌟"}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Yes / No Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAnswer("Yes")}
                                    disabled={feedback !== null}
                                    className="flex-1 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black text-2xl sm:text-3xl py-6 sm:py-8 rounded-3xl shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                                >
                                    <CheckCircle size={40} />
                                    YES
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAnswer("No")}
                                    disabled={feedback !== null}
                                    className="flex-1 bg-gradient-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-black text-2xl sm:text-3xl py-6 sm:py-8 rounded-3xl shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                                >
                                    <XCircle size={40} />
                                    NO
                                </motion.button>
                            </div>

                            {/* Next Arrow */}
                            <div className="flex justify-center pt-6">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={goToNext}
                                    className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110"
                                >
                                    <ArrowRight size={32} />
                                </motion.button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}

