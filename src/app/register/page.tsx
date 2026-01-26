// app/register/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

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
                // if (detail?.includes("Failed to send")) {
                //     setError("Failed to send verification email. Try again later.");
                // } else if (detail?.includes("verify")) {
                //     setError("Please verify your email first.");
                // } else {
                //     setError(detail || "Registration failed.");
                // }
            } else {
                setError("Network error. Try again.");
            }
        }
    };

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-green-200 text-center"
                >
                    <div className="text-6xl mb-4">📧</div>
                    <h1 className="text-3xl font-bold mb-4 text-green-600">
                        Check Your Email!
                    </h1>
                    <p className="text-gray-700 mb-6">
                        We sent a verification link to <strong>{email}</strong>
                    </p>
                    <p className="text-gray-600 text-sm mb-8">
                        Click the link in the email to activate your account. Then you can login!
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full bg-linear-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl text-xl font-bold hover:opacity-90 transition"
                    >
                        Go to Login
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-purple-200">
                <h1 className="text-4xl font-bold text-center mb-8 text-purple-600">
                    Join SpeechFun Kids! 🌈
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Create a password (min 8 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                        required
                        minLength={8}
                    />

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl text-xl font-bold hover:opacity-90 transition"
                    >
                        Register Now!
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-700">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 font-medium hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </main>
    );
}
