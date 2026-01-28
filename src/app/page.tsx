// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Play, Volume2, HelpCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import SpeechButton from "@/components/SpeechButton";
import Navbar from "@/components/Navbar";
import confetti from "canvas-confetti";


// ── Interfaces matching your current backend JSON ────────────────────────────
interface Letter {
  id: number;
  letter: string;
}

interface Word {
  id: number;
  word: string;
  audio: string | null;  // relative path like "/media/audios/apple.mp3"
  difficulty: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  letter_name: string;   // "A", "B", etc.
  word: Word;            // nested
  difficulty: string;
  created_at: string;
}

interface ProgressItem {
  challenge: number;
  completed: boolean;
  score: number;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const { data: session, status } = useSession();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("easy");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [totalStars, setTotalStars] = useState<number>(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/challenges/letters/`)
      .then((res) => setLetters(res.data))
      .catch((err) => console.error("Failed to load letters", err));
  }, []);

  // Get or create Django auth token when user logs in
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

  // Load user's progress
  useEffect(() => {
    if (!authToken || progressLoaded) return;

    const loadProgress = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
          headers: { Authorization: `Token ${authToken}` },
        });

        const completed = new Set<number>(res.data.map((p: ProgressItem) => p.challenge));
        setCompletedChallenges(completed);
        setTotalStars(completed.size);
        setProgressLoaded(true);
      } catch (err) {
        console.error("Failed to load progress", err);
        setProgressLoaded(true);
      }
    };

    loadProgress();
  }, [authToken, progressLoaded]);

  const loadChallenges = async (letterId: number, difficulty: string) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/challenges/letters/${letterId}/challenges/?difficulty=${difficulty}`
      );
      setChallenges(res.data);
    } catch (err) {
      console.error("Failed to load challenges", err);
      setChallenges([]);
    }
  };

  const loadWords = async (letterId: number, difficulty: string) => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/challenges/letters/${letterId}/words/?difficulty=${difficulty}`
      );
      setWords(res.data);
    } catch (err) {
      console.error("Failed to load words", err);
      setWords([]);
    }
  };

  const handleLetterClick = async (letterId: number) => {
    setSelectedLetter(letterId);
    await loadChallenges(letterId, selectedDifficulty);
    await loadWords(letterId, selectedDifficulty);
  };

  const handleDifficultyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = e.target.value;
    setSelectedDifficulty(newDiff);
    if (selectedLetter) {
      await loadChallenges(selectedLetter, newDiff);
      await loadWords(selectedLetter, newDiff);
    }
  };

  // confetti function
  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSpeechResult = async (isCorrect: boolean, transcript: string, challengeId: number) => {
    if (completedChallenges.has(challengeId)) {
      alert(isCorrect ? `✅ Already completed!` : `❌ Try again!`);
      return;
    }

    if (isCorrect) {
      const success = await handleEarnStar(challengeId);
      if (success) {
        fireConfetti();
        alert(`🎉 Perfect! You said "${transcript}". Star earned! ⭐`);
      }
    } else {
      alert(`❌ Not quite! You said "${transcript}" Try again!`);
    }
  };

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

      setCompletedChallenges((prev) => new Set([...prev, challengeId]));
      setTotalStars((prev) => prev + 1);
      return true;
    } catch (err) {
      console.error("Progress update failed", err);
      alert("Failed to save star.");
      return false;
    }
  };

  const playAudio = (audioPath: string) => {
    const fullUrl = audioPath.startsWith("http") ? audioPath : `${backendUrl}${audioPath}`;
    console.log("Playing:", fullUrl);

    const audio = new Audio(fullUrl);
    audio.play().catch((err) => {
      console.error("Audio error:", err);
      alert("Couldn't play audio – check URL or permissions.");
    });
  };

  const getAIHelp = async (word: string) => {
    setLoadingAI(true);
    setAiExplanation("");

    try {
      const response = await axios.post(`${backendUrl}/api/users/ai-help/`, {
        word: word
      });

      setAiExplanation(response.data.explanation);
    } catch (error) {
      console.error("AI helper error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setAiExplanation(error.response.data.error);
      } else {
        setAiExplanation("Oops! I couldn't get help right now. Try again later! 😊");
      }
    } finally {
      setLoadingAI(false);
    }
  };


  if (status === "loading") return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <>
      {session && <Navbar totalStars={totalStars} />}
      {/* <main className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1
       className="title mb-10 text-center"
       initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring" }}
      >
         SpeechFun Kids! 🎤✨
       </motion.h1> */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {session ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-xl font-bold text-purple-700">
                  Hi {session.user?.name || session.user?.username}! Let&apos;s talk! 🗣️
                </p>
                <p className="text-lg text-yellow-600 font-bold mt-1 flex items-center gap-2">
                  <Star size={20} fill="gold" className="text-yellow-500" />
                  Stars: {totalStars}
                </p>
              </div>
              {/* <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow"
            >
              <LogOut size={20} /> Logout
            </button> */}
            </div>

            {selectedLetter && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                <div className="inline-flex items-center gap-3 bg-white/90 p-3 rounded-xl shadow-lg border-2 border-purple-300">
                  <label className="text-lg font-bold text-purple-700">Level:</label>
                  <select
                    value={selectedDifficulty}
                    onChange={handleDifficultyChange}
                    className="p-2 border-2 border-purple-300 rounded-lg text-lg font-semibold bg-white hover:border-purple-500 transition cursor-pointer"
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Letter Grid - Updated for mobile */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 sm:gap-4">
              {letters.map((letter) => (
                <motion.button
                  key={letter.id}
                  onClick={() => handleLetterClick(letter.id)}
                  className={`p-4 sm:p-6 text-4xl sm:text-5xl font-bold rounded-2xl shadow-lg transition-all ${selectedLetter === letter.id
                    ? "bg-linear-to-br from-pink-400 to-purple-500 scale-110 text-white"
                    : "bg-linear-to-br from-yellow-300 to-orange-400 hover:scale-105"
                    }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {letter.letter}
                </motion.button>
              ))}
            </div>
            {/* Challenges Section */}
            <AnimatePresence mode="wait">
              {selectedLetter && (
                <motion.div
                  key={`${selectedLetter}-${selectedDifficulty}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <section className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-indigo-700">
                      🎯 Challenges for Letter {letters.find((l) => l.id === selectedLetter)?.letter}
                    </h2>

                    {challenges.length > 0 ? (
                      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                        {challenges.map((challenge) => {
                          const targetWord = challenge.word?.word || challenge.title.replace(/^say /i, "").trim();
                          const isCompleted = completedChallenges.has(challenge.id);

                          return (
                            <motion.div
                              key={challenge.id}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={`bg-linear-to-br from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl shadow-md border-2 ${isCompleted ? "border-green-400 bg-green-50" : "border-purple-200"
                                }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-purple-800">{challenge.title}</h3>
                                {isCompleted && <span className="text-2xl sm:text-3xl">⭐</span>}
                              </div>

                              <div className="text-gray-700 mb-4 flex items-center justify-between">
                                {challenge.word?.audio && (
                                  <button
                                    onClick={() => playAudio(challenge.word.audio!)}
                                    className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md transition transform hover:scale-105"
                                    title="Listen to example"
                                  >
                                    <Volume2 size={16} />
                                    <span className="text-sm font-semibold">Hear It!</span>
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <SpeechButton
                                  expectedText={targetWord}
                                  onResult={(isCorrect, transcript) =>
                                    handleSpeechResult(isCorrect, transcript, challenge.id)
                                  }
                                />
                                {isCompleted && (
                                  <div className="flex items-center justify-center sm:justify-start gap-2 text-green-600 font-bold">
                                    <Star size={20} fill="currentColor" /> Completed!
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-lg sm:text-xl text-gray-500">No {selectedDifficulty} challenges yet for this letter.</p>
                        <p className="text-sm sm:text-md text-gray-400 mt-2">Try a different level! 🎮</p>
                      </div>
                    )}
                  </section>

                  {/* Words Section */}
                  <section className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-xl">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-indigo-700">
                      📚 Words to Practice
                    </h2>

                    {words.length > 0 ? (
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {words.map((word) => (
                          <motion.div
                            key={word.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-linear-to-br from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl shadow-md border-2 border-blue-200 text-center hover:scale-105 transition"
                          >
                            <p className="text-xl sm:text-2xl font-bold mb-3 text-blue-800">{word.word}</p>

                            <div className="space-y-2">
                              {word.audio && (
                                <button
                                  onClick={() => playAudio(word.audio!)}
                                  className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                                >
                                  <Play size={20} /> Listen!
                                </button>
                              )}

                              {/* AI Helper Button */}
                              <button
                                onClick={() => {
                                  setSelectedWord(word);
                                  setAiHelperOpen(true);
                                  getAIHelp(word.word);
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                              >
                                <HelpCircle size={20} /> Ask AI Helper
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-lg sm:text-xl text-gray-500">No {selectedDifficulty} words yet for this letter.</p>
                        <p className="text-sm sm:text-md text-gray-400 mt-2">Try a different level! 📖</p>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center mt-16 px-4">
            <p className="text-xl sm:text-2xl mb-8 text-purple-700">Ready for fun speech games?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link
                href="/login"
                className="bg-linear-to-r from-green-400 to-teal-500 text-white text-lg sm:text-xl font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-lg hover:scale-105 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-linear-to-r from-pink-400 to-purple-500 text-white text-lg sm:text-xl font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl shadow-lg hover:scale-105 transition"
              >
                Register
              </Link>
            </div>
            <p className="mt-6 text-base sm:text-lg">or login with Google for quick start!</p>
          </div>
        )}
      </main >
      {/* AI Helper Modal */}
      {aiHelperOpen && selectedWord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setAiHelperOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                <span className="text-3xl">🤖</span> AI Helper
              </h3>
              <button
                onClick={() => setAiHelperOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-bold text-center text-purple-700">
                {selectedWord.word}
              </p>
            </div>

            {loadingAI ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">AI is thinking... 🤔</p>
              </div>
            ) : (
              <div className="bg-linear-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            )}

            <button
              onClick={() => setAiHelperOpen(false)}
              className="mt-6 w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              Got it! Thanks! 👍
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
