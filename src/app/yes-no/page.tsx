"use client";

import { useEffect, useState, useRef } from "react";
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


    // For mobile swiping
    // Swipe logic - attach to PARENT container (never re-mounts)
    // const swipeContainerRef = useRef<HTMLDivElement>(null);
    // const touchStartX = useRef<number>(0);
    // const touchStartY = useRef<number>(0);

    // useEffect(() => {
    //     const container = swipeContainerRef.current;
    //     if (!container) return;

    //     let touchMoved = false;

    //     const handleTouchStart = (e: TouchEvent) => {
    //         touchStartX.current = e.touches[0].clientX;
    //         touchStartY.current = e.touches[0].clientY;
    //         touchMoved = false;
    //     };

    //     const handleTouchMove = (e: TouchEvent) => {
    //         if (!touchStartX.current) return;

    //         const deltaX = e.touches[0].clientX - touchStartX.current;
    //         const deltaY = e.touches[0].clientY - touchStartY.current;

    //         // If mostly horizontal → prevent page scroll
    //         if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
    //             e.preventDefault(); // Blocks horizontal page scroll
    //             touchMoved = true;
    //         }
    //     };

    //     const handleTouchEnd = (e: TouchEvent) => {
    //         if (!touchStartX.current || !touchMoved) return;

    //         const diffX = touchStartX.current - e.changedTouches[0].clientX;
    //         const SWIPE_THRESHOLD = 60; // pixels

    //         if (Math.abs(diffX) > SWIPE_THRESHOLD) {
    //             if (diffX > 0) {
    //                 // Swipe left → next
    //                 if (currentIndex < questions.length - 1) {
    //                     setCurrentIndex(prev => prev + 1);
    //                     setFeedback(null);
    //                     setJustCompleted(false);
    //                 }
    //             } else {
    //                 // Swipe right → previous
    //                 if (currentIndex > 0) {
    //                     setCurrentIndex(prev => prev - 1);
    //                     setFeedback(null);
    //                     setJustCompleted(false);
    //                 }
    //             }
    //         }

    //         touchStartX.current = 0;
    //         touchStartY.current = 0;
    //     };

    //     container.addEventListener("touchstart", handleTouchStart, { passive: true });
    //     container.addEventListener("touchmove", handleTouchMove, { passive: false }); // Allows preventDefault
    //     container.addEventListener("touchend", handleTouchEnd, { passive: true });

    //     return () => {
    //         container.removeEventListener("touchstart", handleTouchStart);
    //         container.removeEventListener("touchmove", handleTouchMove);
    //         container.removeEventListener("touchend", handleTouchEnd);
    //     };
    // }, [currentIndex, questions.length]); // deps for fresh index/length

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
    //ref={swipeContainerRef} add after mx-auto
    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-6 sm:py-10 px-4"> {/* ← Increased top/bottom padding for breathing room */}
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-purple-700 mb-6 sm:mb-10">
                    Yes / No Lab 🧐
                </h1>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-4 border-purple-200 touch-pan-y" // ✨ ADDED: touch-pan-y allows vertical scroll but captures horizontal swipes
                    >
                        {/* Progress indicator */}
                        <div className="text-center mb-4 sm:mb-6">
                            <p className="text-base sm:text-lg font-bold text-purple-600">
                                Question {currentIndex + 1} of {questions.length}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mt-2">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Stars display */}
                        <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
                            <Star size={24} className="text-yellow-500 fill-yellow-500 animate-pulse sm:w-8 sm:h-8" />
                            <span className="text-2xl sm:text-3xl font-black text-purple-700">{stars}</span>
                        </div>

                        {/* Completion Badge */}
                        {isCompleted && (
                            <div className="flex justify-center mb-4 sm:mb-6">
                                <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-sm sm:text-lg flex items-center gap-2">
                                    <Star size={20} className="fill-yellow-400 text-yellow-400 sm:w-6 sm:h-6" />
                                    Challenge Completed!
                                </div>
                            </div>
                        )}

                        {/* Visual - SHORTER & CONTAIN */}
                        {question.visual_url && (
                            <div className="relative w-full h-40 sm:h-56 md:h-72 mb-4 sm:mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white"> {/* ← Shorter heights */}
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

                        {/* Question - Smaller text */}
                        <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-6 leading-relaxed">
                            {question.question}
                        </h2>

                        {/* Feedback */}
                        {feedback && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`text-center text-base sm:text-lg md:text-xl font-black mb-4 sm:mb-6 ${feedback === "correct" ? "text-green-600" : "text-red-600"}`}
                            >
                                {feedback === "correct" && !wasAlreadyCompleted && "🎉 Yes! Great job! +1 ⭐"}
                                {feedback === "correct" && wasAlreadyCompleted && "🎉 Correct! (Already completed)"}
                                {feedback === "incorrect" && "Not quite... try again!"}
                            </motion.div>
                        )}

                        {/* Answer Buttons - Smaller padding */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer("Yes")}
                                className="flex-1 bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-black text-lg sm:text-2xl md:text-3xl py-3 sm:py-5 rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                            >
                                <CheckCircle size={32} className="sm:w-10 sm:h-10" />
                                YES
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer("No")}
                                className="flex-1 bg-gradient-to-br from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-black text-lg sm:text-2xl md:text-3xl py-3 sm:py-5 rounded-3xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border-4 border-white"
                            >
                                <XCircle size={32} className="sm:w-10 sm:h-10" />
                                NO
                            </motion.button>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex justify-between items-center pt-3 sm:pt-5"> {/* ← Reduced pt */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToPrevious}
                                disabled={currentIndex === 0}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-3 sm:p-5 rounded-full shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
                            </motion.button>

                            <div className="hidden sm:block text-center text-gray-600 font-medium text-sm">
                                Swipe or use arrows to navigate
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNext}
                                disabled={currentIndex === questions.length - 1}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-3 sm:p-5 rounded-full shadow-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={32} className="sm:w-10 sm:h-10" />
                            </motion.button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
