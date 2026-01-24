// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, LogOut, Play, Volume2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import SpeechButton from "@/components/SpeechButton";

interface Letter {
  id: number;
  letter: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  letter_id: number;
  difficulty: string;
  audio?: string | null;
}

interface Word {
  id: number;
  word: string;
  audio: string | null;
  difficulty: string;
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
        // Try to get existing token or create new one
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

  // Load user's progress when auth token is available
  useEffect(() => {
    if (!authToken || progressLoaded) return;

    const loadProgress = async () => {
      try {
        console.log("Loading user progress with token:", authToken);
        const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
          headers: {
            Authorization: `Token ${authToken}`,
          }
        });

        const completed = new Set<number>(
          res.data.map((p: ProgressItem) => p.challenge)
        );

        setCompletedChallenges(completed);
        setTotalStars(completed.size);
        setProgressLoaded(true);
      } catch (err) {
        console.error("Failed to load user progress", err);
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

  const handleSpeechResult = async (isCorrect: boolean, transcript: string, challengeId: number) => {
    if (completedChallenges.has(challengeId)) {
      if (isCorrect) {
        alert(`✅ Correct! You said: "${transcript}". (Already completed)`);
      } else {
        alert(`❌ Not quite! You said: "${transcript}". Try again!`);
      }
      return;
    }

    if (isCorrect) {
      const success = await handleEarnStar(challengeId);
      if (success) {
        alert(`🎉 Perfect! You said: "${transcript}". Star earned! ⭐`);
      }
    } else {
      alert(`❌ Not quite! You said: "${transcript}". Try again!`);
    }
  };

  const handleEarnStar = async (challengeId: number): Promise<boolean> => {
    if (!authToken) {
      alert("Please wait, authentication is loading...");
      return false;
    }

    try {
      console.log("Earning star with token:", authToken);
      await axios.post(
        `${backendUrl}/api/challenges/progress/update/`,
        {
          challenge: challengeId,
          completed: true,
          score: 100
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setCompletedChallenges(prev => new Set(prev).add(challengeId));
      setTotalStars(prev => prev + 1);
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<{ detail?: string }>;
      console.error("Failed to update progress", err);
      console.error("Error response:", axiosError.response?.data);
      alert(`Error saving progress: ${axiosError.response?.data?.detail || axiosError.message || "Unknown error"}`);
      return false;
    }
  };

  const playAudio = (audioPath: string) => {
    let audioUrl = audioPath;

    if (audioPath.startsWith('/')) {
      audioUrl = `${backendUrl}${audioPath}`;
    }

    console.log("Playing audio from:", audioUrl);

    const audio = new Audio(audioUrl);
    audio.play().catch((err) => {
      console.error("Audio playback failed", err);
      console.error("Attempted URL:", audioUrl);
      alert("Sorry, couldn't play the audio!");
    });
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1
        className="title mb-10"
        initial={{ opacity: 0, y: -60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, type: "spring" }}
      >
        SpeechFun Kids! 🎤✨
      </motion.h1>

      {session ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-purple-700">
                Hi {session.user?.name || session.user?.username}! Let&apos;s talk! 🗣️
              </p>
              <p className="text-lg text-yellow-600 font-bold mt-1 flex items-center gap-2">
                <Star size={20} fill="gold" className="text-yellow-500" />
                Gold Stars: {totalStars}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>

          {selectedLetter && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
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

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-4">
            {letters.map((letter: Letter) => (
              <motion.button
                key={letter.id}
                onClick={() => handleLetterClick(letter.id)}
                className={`p-6 text-5xl font-bold rounded-2xl shadow-lg transition-all ${selectedLetter === letter.id
                  ? "bg-linear-to-br from-pink-400 to-purple-500 scale-110"
                  : "bg-linear-to-br from-yellow-300 to-orange-400 hover:scale-105"
                  }`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {letter.letter}
              </motion.button>
            ))}
          </div>

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
                <section className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
                    🎯 Challenges for Letter {letters.find((l) => l.id === selectedLetter)?.letter}
                  </h2>

                  {challenges.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {challenges.map((challenge: Challenge) => {
                        const targetWord = challenge.title.split(' ').pop() || challenge.title;
                        const isCompleted = completedChallenges.has(challenge.id);

                        return (
                          <motion.div
                            key={challenge.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md border-2 ${isCompleted ? 'border-green-400 bg-green-50' : 'border-purple-200'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-2xl font-bold text-purple-800">{challenge.title}</h3>
                              {isCompleted && <span className="text-3xl">⭐</span>}
                            </div>
                            <div className="text-gray-700 mb-4 flex items-center justify-between">
                              <span className="flex-1">{challenge.description}</span>
                              {challenge.audio && (
                                <button
                                  onClick={() => playAudio(challenge.audio!)}
                                  className="ml-3 flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md transition transform hover:scale-105"
                                  title="Listen to example"
                                >
                                  <Volume2 size={16} />
                                  <span className="text-sm font-semibold">Hear It!</span>
                                </button>
                              )}
                            </div>
                            <div className="flex gap-4 items-center">
                              <SpeechButton
                                expectedText={targetWord}
                                onResult={(isCorrect, transcript) =>
                                  handleSpeechResult(isCorrect, transcript, challenge.id)
                                }
                              />
                              {isCompleted && (
                                <div className="flex items-center gap-2 text-green-600 font-bold">
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
                      <p className="text-xl text-gray-500">
                        No {selectedDifficulty} challenges yet for this letter.
                      </p>
                      <p className="text-md text-gray-400 mt-2">
                        Try a different difficulty level! 🎮
                      </p>
                    </div>
                  )}
                </section>

                <section className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
                  <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
                    📚 Words to Practice
                  </h2>

                  {words.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {words.map((word: Word) => (
                        <motion.div
                          key={word.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="bg-linear-to-br from-green-50 to-blue-50 p-6 rounded-xl shadow-md border-2 border-blue-200 text-center hover:scale-105 transition"
                        >
                          <p className="text-2xl font-bold mb-3 text-blue-800">{word.word}</p>
                          {word.audio && (
                            <button
                              onClick={() => playAudio(word.audio!)}
                              className="flex items-center gap-2 mx-auto bg-linear-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                            >
                              <Play size={20} /> Listen!
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-xl text-gray-500">
                        No {selectedDifficulty} words yet for this letter.
                      </p>
                      <p className="text-md text-gray-400 mt-2">
                        Try a different difficulty level! 📖
                      </p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center mt-16">
          <p className="text-2xl mb-8 text-purple-700">Ready for fun speech games?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              href="/login"
              className="bg-linear-to-r from-green-400 to-teal-500 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-lg hover:scale-105 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-linear-to-r from-pink-400 to-purple-500 text-white text-xl font-bold px-10 py-5 rounded-2xl shadow-lg hover:scale-105 transition"
            >
              Register
            </Link>
          </div>
          <p className="mt-6 text-lg">or login with Google for quick start!</p>
        </div>
      )}
    </main>
  );
}
