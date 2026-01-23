// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { Mic, Star, LogOut } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Letter {
  id: number;
  letter: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  letter_id: number;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const { data: session, status } = useSession();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/challenges/letters/`)
      .then((res) => setLetters(res.data))
      .catch((err) => console.error("Failed to load letters", err));
  }, []);

  // Log session status for debugging
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleLetterClick = async (letterId: number) => {
    setSelectedLetter(letterId);
    try {
      const res = await axios.get(
        `${backendUrl}/api/challenges/letters/${letterId}/challenges/?difficulty=easy`
      );
      setChallenges(res.data);
    } catch (err) {
      console.error("Failed to load challenges", err);
    }
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
            <p className="text-xl font-bold text-purple-700">
              Hi {session.user?.name || session.user?.username}! Let&apos;s talk! 🗣️
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>

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

          {selectedLetter && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl"
            >
              <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
                Challenges for Letter {letters.find((l) => l.id === selectedLetter)?.letter}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {challenges.map((challenge: Challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md border border-purple-200"
                  >
                    <h3 className="text-2xl font-bold mb-2 text-purple-800">{challenge.title}</h3>
                    <p className="text-gray-700 mb-4">{challenge.description}</p>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg">
                        <Mic size={20} /> Say It!
                      </button>
                      <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg">
                        <Star size={20} /> Earn Star
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
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
