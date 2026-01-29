// app/register/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWarmBackend } from "../hooks/useWarmBackend";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false)
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);


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

            // Success!
            setSuccess(true);
            setError("");

        } catch (err) {
            setLoading(false); // ← Reset loading state on error

            if (axios.isAxiosError(err)) {
                // Handle different error types
                const errorData = err.response?.data;

                if (errorData?.detail) {
                    // Server returned a detail message
                    setError(errorData.detail);
                } else if (errorData?.username) {
                    // Username validation error
                    setError(`Username: ${errorData.username[0]}`);
                } else if (errorData?.email) {
                    // Email validation error
                    setError(`Email: ${errorData.email[0]}`);
                } else if (errorData?.password) {
                    // Password validation error
                    setError(`Password: ${errorData.password[0]}`);
                } else {
                    setError("Registration failed. Please check your information and try again.");
                }
            } else {
                setError("Network error. Please check your connection and try again.");
            }

            // Don't set loading to false in finally - only on error
            // Success case keeps loading true until success screen shows
        }
    };

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
                {/* Background Image */}
                <Image
                    src="/the-block-with-the-letter-b-in-the-boy-s_DjRnOEfTSAeWOz9g7oAW8g_4VlVk0H-RSu6txbQXmJ1aA.png"
                    alt="Kids learning"
                    fill
                    className="object-cover -z-10 opacity-20"
                    quality={100}
                    priority
                />

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 -z-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.9) 0%, rgba(245, 87, 108, 0.9) 100%)',
                    }}
                />
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
        <main className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background Image Container – explicit positioning */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/the-block-with-the-letter-b-in-the-boy-s_DjRnOEfTSAeWOz9g7oAW8g_4VlVk0H-RSu6txbQXmJ1aA.png"
                    alt="Kids learning and playing with speech bubbles – fun educational background"
                    fill
                    className="object-cover opacity-100"  // ↑ increased slightly for visibility during debug
                    quality={85}  // good balance for background
                    priority      // preload since it's hero/background
                />
            </div>

            {/* Gradient Overlay – now on top of image */}
            <div
                className="absolute inset-0 z-5"
                style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.45) 0%, rgba(118, 75, 162, 0.45) 50%, rgba(240, 147, 251, 0.45) 100%)',
                }}
            />
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden z-10">
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
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 8 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 pr-12 rounded-xl border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg font-medium"
                            required
                            minLength={8}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                            disabled={loading}
                        >
                            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                    </div>

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
