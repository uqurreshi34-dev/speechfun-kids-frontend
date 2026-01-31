// app/functional/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { useStars } from "@/contexts/StarsContext";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface FunctionalPhrase {
    id: number;
    phrase: string;
    visual_url: string | null;
}
// test for github push
export default function FunctionalLanguage() {
    const [phrases, setPhrases] = useState<FunctionalPhrase[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [feedback, setFeedback] = useState<"correct" | null>(null);
    const [loading, setLoading] = useState(true);
    const [authToken, setAuthToken] = useState<string | null>(null);

    const { stars, completedChallenges, addStar } = useStars();

    // Get auth token
    useEffect(() => {
        const getAuthToken = async () => {
            try {
                const response = await axios.post(
                    `${backendUrl}/api/users/get-or-create-token/`,
                    { email: "user@example.com", username: "user" } // real session later
                );
                setAuthToken(response.data.token);
            } catch (err) {
                console.error("Failed to get token", err);
            }
        };
        getAuthToken();
    }, []);

    // Fetch phrases
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
        if (completedChallenges.has(current.id)) {
            setFeedback("correct");
            setTimeout(() => {
                goToNext();
                setFeedback(null);
            }, 1800);
            return;
        }

        setFeedback("correct");

        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

        const success = await addStar(current.id, 'functional');
        if (success) {
            setTimeout(() => {
                goToNext();
                setFeedback(null);
            }, 2200);
        }
    };

    const goToNext = () => {
        if (currentIndex < phrases.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    if (!current) return <div className="text-center py-20">No phrases yet</div>;

    const isCompleted = completedChallenges.has(current.id);

    return (
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-6 sm:py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-black text-center text-purple-700 mb-10">
                    Functional Language
                </h1>

                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-purple-200">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {current.visual_url && (
                            <div className="h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                                <Image
                                    src={current.visual_url}
                                    alt={current.phrase}
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                />
                            </div>
                        )}

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-indigo-700">
                            {current.phrase}
                        </h2>

                        {isCompleted && (
                            <div className="text-center">
                                <Star size={48} fill="gold" className="text-yellow-500 mx-auto" />
                                <p className="text-xl font-bold text-green-600 mt-2">Already Completed!</p>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleComplete}
                                disabled={isCompleted}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-2xl py-6 px-12 rounded-3xl shadow-xl transition disabled:opacity-50"
                            >
                                I said it! ⭐
                            </motion.button>
                        </div>

                        <div className="flex justify-center pt-6">
                            <button
                                onClick={goToNext}
                                disabled={currentIndex === phrases.length - 1}
                                className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg transition disabled:opacity-30"
                            >
                                <ArrowRight size={32} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
