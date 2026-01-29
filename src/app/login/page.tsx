// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWarmBackend } from "../hooks/useWarmBackend";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)
    const router = useRouter();

    useWarmBackend();

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (result?.ok) {
            router.push("/");
        } else {
            // Better error message
            if (result?.error?.includes("verify")) {
                setError("Please verify your email before logging in. Check your inbox!");
            } else {
                setError("Wrong username or password. Try again!");
            }
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gray-50">
            {/* Background Image Container – explicit positioning */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/the-block-with-the-letter-b-in-the-boy-s_DjRnOEfTSAeWOz9g7oAW8g_4VlVk0H-RSu6txbQXmJ1aA.png"
                    alt="Kids learning and playing with speech bubbles – fun educational background"
                    fill
                    className="object-cover opacity-30"  // ↑ increased slightly for visibility during debug
                    quality={85}  // good balance for background
                    priority      // preload since it's hero/background
                />
            </div>

            {/* Gradient Overlay – now on top of image */}
            <div
                className="absolute inset-0 z-5"
                style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 50%, rgba(240, 147, 251, 0.85) 100%)',
                }}
            />
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-bounce">⭐</div>
                <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌈</div>
                <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎨</div>
                <div className="absolute bottom-10 right-10 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white relative z-10 my-auto"
                style={{
                    boxShadow: '0 0 40px rgba(167, 139, 250, 0.5)'
                }}
            >
                <div className="text-center mb-6">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-5xl sm:text-6xl mb-3"
                    >
                        🎤
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 whitespace-nowrap">
                        Welcome Back!
                    </h1>
                    <p className="text-purple-600 font-bold mt-2 text-sm sm:text-base">Let&apos;s practice speaking! 🗣️</p>  {/* ← Made responsive */}
                </div>

                <form onSubmit={handleCredentials} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="
                  w-full p-4 rounded-xl 
                  border-2 border-purple-300 
                  focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 
                  text-lg font-medium 
                  bg-white/80 
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                  w-full p-4 rounded-xl 
                  border-2 border-purple-300 
                  focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 
                  text-lg font-medium 
                  bg-white/80 
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                        required
                        disabled={loading}
                    />

                    {error && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="
                    bg-red-50 border-2 border-red-300 
                    text-red-700 p-4 rounded-xl 
                    text-center font-semibold
                  "
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                  w-full 
                  bg-gradient-to-r from-green-400 to-teal-500 
                  hover:from-green-500 hover:to-teal-600 
                  text-white py-4 rounded-xl 
                  text-xl font-black 
                  transition-all duration-200 
                  disabled:opacity-60 disabled:cursor-not-allowed 
                  shadow-lg hover:shadow-xl 
                  flex items-center justify-center gap-3
                "
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                                Logging in...
                            </>
                        ) : (
                            <>Login 🚀</>
                        )}
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        disabled={loading}
                        className="
                  w-full 
                  bg-white hover:bg-gray-50 
                  border-2 border-gray-300 
                  text-gray-800 py-4 rounded-xl 
                  text-lg font-bold 
                  transition-all duration-200 
                  disabled:opacity-60 
                  flex items-center justify-center gap-3 
                  shadow-md hover:shadow-lg
                "
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p className="text-center mt-8 text-gray-700 font-medium">
                    New here?{' '}
                    <a
                        href="/register"
                        className="text-purple-700 font-bold hover:text-purple-800 hover:underline transition-colors"
                    >
                        Join the fun! 🎉
                    </a>
                </p>
            </motion.div>
        </main>
    );
}
