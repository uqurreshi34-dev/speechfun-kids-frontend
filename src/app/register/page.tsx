// app/register/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWarmBackend } from "../hooks/useWarmBackend";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false)
    const router = useRouter();


    useWarmBackend();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register/`, {
                username,
                email,
                password,
            });

            // Show success message
            alert(response.data.detail || "Check your email!");
            setSuccess(true);
            setError("");

        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                const detail = err.response?.data?.detail || 'registration failed';
                setError(detail)
            } else {
                setError("Network error. Try again.");
            }
        }
    };

    if (success) {
        return (
            <main
                className="min-h-screen flex items-center justify-center px-4"
                style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white text-center"
                    style={{
                        boxShadow: '0 0 40px rgba(245, 87, 108, 0.5)'
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-8xl mb-4"
                    >
                        📧
                    </motion.div>
                    <h1 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        Check Your Email!
                    </h1>
                    <p className="text-gray-700 mb-6 text-lg font-medium">
                        We sent a verification link to <strong className="text-purple-600">{email}</strong>
                    </p>
                    <p className="text-gray-600 text-base mb-8 font-medium">
                        Click the link in the email to activate your account. Then you can login! ✨
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-4 rounded-xl text-xl font-black hover:opacity-90 transition shadow-lg"
                    >
                        Go to Login 🚀
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 relative"
            style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd876 100%)',
            }}
        >
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 text-6xl animate-bounce">🎨</div>
                <div className="absolute top-20 right-20 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</div>
                <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎪</div>
                <div className="absolute bottom-10 right-10 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>🎈</div>
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white relative z-10"
                style={{
                    boxShadow: '0 0 40px rgba(245, 87, 108, 0.5)'
                }}
            >
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl mb-4"
                    >
                        🌈
                    </motion.div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600">
                        Join SpeechFun!
                    </h1>
                    <p className="text-pink-600 font-bold mt-2">Let&apos;s learn together! 🎉</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-medium"
                        required
                        disabled={loading}
                    />
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-medium"
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Create a password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-medium"
                        required
                        minLength={8}
                        disabled={loading}
                    />

                    {error && (
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-red-50 border-2 border-red-300 text-red-600 p-4 rounded-xl text-center font-bold"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl text-xl font-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Register Now! 🎊
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-700 font-medium">
                    Already have an account?{" "}
                    <a href="/login" className="text-pink-600 font-bold hover:underline">
                        Login here! 👋
                    </a>
                </p>
            </motion.div>
        </main>
    );
}
