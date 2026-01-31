"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Star } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { useStars } from "@/contexts/StarsContext";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface YesNoQuestion {
    id: number;
    scene_description: string;
    question: string;
    correct_answer: string;
    visual_url: string | null;
}

export default function YesNoLab() {
    const { data: session } = useSession();
    const [questions, setQuestions] = useState<YesNoQuestion[]>([]);

    // Initialize currentIndex from sessionStorage with user-specific key
    const [currentIndex, setCurrentIndex] = useState(() => {
        if (typeof window !== 'undefined' && session?.user?.email) {
            const key = `yesNoCurrentIndex_${session.user.email}`;
            const savedIndex = sessionStorage.getItem(key);
            return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
        }
        return 0;
    });

    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
    const [justCompleted, setJustCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { status } = useSession();
    const [authToken, setAuthToken] = useState<string | null>(null);

    const { stars, completedChallenges, addStar, loading: starsLoading } = useStars();

    // Save current index to sessionStorage with user-specific key
    useEffect(() => {
        if (session?.user?.email) {
            const key = `yesNoCurrentIndex_${session.user.email}`;
            sessionStorage.setItem(key, currentIndex.toString());
        }
    }, [currentIndex, session?.user?.email]);

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

                const token = response.data.token;
                setAuthToken(response.data.token);
                console.log("Auth token obtained:", token);
            } catch (err) {
                console.error("Failed to get auth token", err);
            }
        };

        getAuthToken();
    }, [session?.user?.email, session?.user?.name]);

    // Fetch questions
    useEffect(() => {
        if (!authToken) return;

        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/challenges/yes-no-questions/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                setQuestions(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load questions", err);
                setError("Failed to load questions. Please try again later.");
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [authToken]);

    const handleAnswer = async (answer: "Yes" | "No") => {
        const question = questions[currentIndex];
        const isCorrect = answer.toLowerCase() === question.correct_answer.toLowerCase();

        // Check if this was already completed BEFORE this session
        const wasAlreadyCompleted = completedChallenges.has(question.id) && !justCompleted;

        if (wasAlreadyCompleted) {
            // User clicked on an already completed challenge
            setFeedback(isCorrect ? "correct" : "incorrect");
            return;
        }

        setFeedback(isCorrect ? "correct" : "incorrect");

        if (isCorrect && !completedChallenges.has(question.id)) {
            confetti();
            setJustCompleted(true);

            try {
                await addStar(question.id, 'yes_no');
            } catch (err) {
                console.error("Failed to award star", err);
                alert("Failed to save progress. Please try again.");
            }
        }
    };

    const goToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFeedback(null);
            setJustCompleted(false);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setFeedback(null);
            setJustCompleted(false);
        }
    };

    if (status === "loading" || loading || starsLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600 mt-10">{error}</div>;
    }

    if (questions.length === 0) {
        return <div className="text-center text-gray-600 mt-10">No questions available right now.</div>;
    }

    const question = questions[currentIndex];
    const isCompleted = completedChallenges.has(question.id);
    const wasAlreadyCompleted = isCompleted && !justCompleted;

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-black text-center text-purple-700 mb-8">
                    Yes / No Lab 🧐
                </h1>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-purple-200"
                    >
                        {/* Progress indicator */}
                        <div className="text-center mb-6">
                            <p className="text-xl font-bold text-purple-600">
                                Question {currentIndex + 1} of {questions.length}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Stars display */}
                        <div className="flex justify-center items-center gap-3 mb-8">
                            <Star size={32} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                            <span className="text-3xl font-black text-purple-700">{stars}</span>
                        </div>

                        {/* Completion Badge - Shows if already completed */}
                        {isCompleted && (
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2">
                                    <Star size={24} className="fill-yellow-400 text-yellow-400" />
                                    Challenge Completed!
                                </div>
                            </div>
                        )}

                        {/* Visual - Fixed sizing with white background */}
                        {question.visual_url && (
                            <div className="relative w-full h-64 sm:h-80 mb-8 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
                                <Image
                                    src={question.visual_url.startsWith("http") ? question.visual_url : `${backendUrl}${question.visual_url}`}
                                    alt={question.scene_description}
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                    priority
                                />
                            </div>
                        )}

                        {/* Question */}
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-10 leading-relaxed">
                            {question.question}
                        </h2>

                        {/* Feedback */}
                        {feedback && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`text-center text-2xl font-black mb-8 ${feedback === "correct" ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {feedback === "correct" && !wasAlreadyCompleted && "🎉 Yes! Great job! +1 ⭐"}
                                {feedback === "correct" && wasAlreadyCompleted && "🎉 Correct! (Already completed)"}
                                {feedback === "incorrect" && "Not quite... try again!"}
                            </motion.div>
                        )}

                        {/* Answer Buttons - Always enabled */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer("Yes")}
                                className="flex-1 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black text-2xl sm:text-3xl py-6 sm:py-8 rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                            >
                                <CheckCircle size={40} />
                                YES
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer("No")}
                                className="flex-1 bg-gradient-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-black text-2xl sm:text-3xl py-6 sm:py-8 rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                            >
                                <XCircle size={40} />
                                NO
                            </motion.button>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex justify-between items-center pt-8">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToPrevious}
                                disabled={currentIndex === 0}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-5 rounded-full shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={40} />
                            </motion.button>

                            <div className="text-center text-gray-600 font-medium">
                                Swipe or use arrows to navigate
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNext}
                                disabled={currentIndex === questions.length - 1}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-5 rounded-full shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={40} />
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
