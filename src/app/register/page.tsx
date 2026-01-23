// app/register/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register/`, {
                username,
                email,
                password,
            });

            // Auto-login after successful registration
            const result = await signIn("credentials", {
                redirect: false,
                username,
                password,
            });

            if (result?.ok) {
                router.push("/");
            } else {
                setError("Registration worked, but auto-login failed. Please login manually.");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.detail || "Registration failed. Try again.");
            } else {
                setError("Registration failed. Try again.");
            }
        }
    };

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
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                        required
                    />

                    {error && <p className="text-red-600 text-center font-medium">{error}</p>}

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
