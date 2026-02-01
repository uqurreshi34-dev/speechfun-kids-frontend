// app/functional/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Volume2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { useStars } from "@/contexts/StarsContext";
import { useSession } from "next-auth/react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface FunctionalPhrase {
    id: number;
    phrase: string;
    visual_url: string | null;
}

export default function FunctionalLanguage() {
    const { data: session } = useSession();
    const [phrases, setPhrases] = useState<FunctionalPhrase[]>([]);

    const [currentIndex, setCurrentIndex] = useState(() => {
        if (typeof window !== 'undefined' && session?.user?.email) {
            const key = `functionalCurrentIndex_${session.user.email}`;
            const savedIndex = sessionStorage.getItem(key);
            return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
        }
        return 0;
    });

    const [feedback, setFeedback] = useState<"correct" | "already_done" | null>(null);
    // ✨ CHANGED: replaced justCompleted state with a Set ref that tracks IDs completed in this session
    const completedThisSession = useRef<Set<number>>(new Set());
    // ✨ NEW: track which user the ref belongs to
    const currentUserRef = useRef<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    const { stars, completedChallenges, addStar } = useStars();

    // ✨ NEW: Reset completedThisSession when user changes
    useEffect(() => {
        const email = session?.user?.email || null;
        if (currentUserRef.current !== email) {
            currentUserRef.current = email;
            completedThisSession.current = new Set();
        }
    }, [session?.user?.email]);

    useEffect(() => {
        if (session?.user?.email) {
            const key = `functionalCurrentIndex_${session.user.email}`;
            sessionStorage.setItem(key, currentIndex.toString());
        }
    }, [currentIndex, session?.user?.email]);

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
                console.error("Failed to get token", err);
            }
        };

        getAuthToken();
    }, [session?.user?.email, session?.user?.name]);

    useEffect(() => {
        if (!authToken) return;

        const fetchPhrases = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/challenges/functional-phrases/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                setPhrases(res.data);
            } catch (err) {
                console.error("Failed to load phrases", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhrases();
    }, [authToken]);

    const current = phrases[currentIndex];


    const handleComplete = async () => {
        // ✨ CHANGED: snapshot the check at click time, not from derived render variables
        const alreadyDone = completedChallenges.has(current.id) || completedThisSession.current.has(current.id);

        if (alreadyDone) {
            setFeedback("already_done");
            setTimeout(() => setFeedback(null), 1800);
            return;
        }

        setFeedback("correct");
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        // ✨ CHANGED: Mark in the ref BEFORE calling addStar so the optimistic update re-render doesn't flip it
        completedThisSession.current.add(current.id);

        try {
            await addStar(current.id, 'functional');
        } catch (err) {
            console.error("Failed to award star", err);
            // ✨ Rollback the ref if it failed
            completedThisSession.current.delete(current.id);
            alert("Failed to save progress. Please try again.");
        }
    };

    const speakPhrase = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(current.phrase);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            speechSynthesis.speak(utterance);
        } else {
            alert("Speech synthesis not supported in this browser.");
        }
    };

    const goToNext = () => {
        if (currentIndex < phrases.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFeedback(null);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setFeedback(null);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    if (!phrases.length) return <div className="text-center text-gray-600 mt-10">No phrases available yet.</div>;

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-6 sm:py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-purple-700 mb-6 sm:mb-10">
                    Functional Language Builder
                </h1>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-4 border-purple-200"
                    >
                        {/* Star count */}
                        <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
                            <Star size={24} className="text-yellow-500 fill-yellow-500 animate-pulse sm:w-8 sm:h-8" />
                            <span className="text-2xl sm:text-3xl font-black text-purple-700">{stars}</span>
                        </div>

                        {/* Visual */}
                        {current.visual_url && (
                            <div className="relative w-full h-40 sm:h-56 md:h-72 mb-4 sm:mb-6 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white">
                                <Image
                                    src={current.visual_url.startsWith("http") ? current.visual_url : `${backendUrl}${current.visual_url}`}
                                    alt={current.phrase}
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                    priority
                                />
                            </div>
                        )}

                        {/* Phrase */}
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-6 sm:mb-8 leading-relaxed">
                            {current.phrase}
                        </h2>

                        {/* Hear It! Button */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={speakPhrase}
                                className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white font-bold text-lg sm:text-xl py-3 px-8 rounded-2xl shadow-md transition flex items-center gap-2"
                            >
                                <Volume2 size={24} />
                                Hear It!
                            </motion.button>
                        </div>

                        {/* Complete Button */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleComplete}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-xl sm:text-2xl py-5 sm:py-6 px-10 sm:px-12 rounded-3xl shadow-xl transition"
                            >
                                I said it! ⭐
                            </motion.button>
                        </div>

                        {/* Feedback */}
                        {feedback && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`text-center text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-6 ${feedback === "correct" ? "text-green-600" : "text-blue-600"
                                    }`}
                            >
                                {feedback === "correct" && "🎉 Great job! +1 ⭐"}
                                {feedback === "already_done" && "Already completed! 🌟"}
                            </motion.div>
                        )}

                        {/* Navigation Arrows */}
                        <div className="flex justify-between items-center pt-4 sm:pt-6">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToPrevious}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-3 sm:p-5 rounded-full shadow-lg transition"
                            >
                                <ChevronLeft size={32} className="sm:w-10 sm:h-10" />
                            </motion.button>

                            <div className="text-center text-gray-600 font-medium text-sm">
                                Phrase {currentIndex + 1} of {phrases.length}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNext}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-3 sm:p-5 rounded-full shadow-lg transition"
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
