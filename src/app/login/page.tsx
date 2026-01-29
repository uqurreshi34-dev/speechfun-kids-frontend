// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWarmBackend } from "../hooks/useWarmBackend";

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
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-green-200">
                <h1 className="text-4xl font-bold text-center mb-8 text-green-600">
                    Welcome Back! 🎉
                </h1>

                <form onSubmit={handleCredentials} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-lg"
                        required
                    />

                    {error && <p className="text-red-600 text-center font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl text-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Logging in...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        disabled={loading}
                        className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 py-4 rounded-xl text-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
                    >
                        {/* Google Logo SVG */}
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p className="text-center mt-6 text-gray-700">
                    New here?{" "}
                    <a href="/register" className="text-purple-600 font-medium hover:underline">
                        Register now
                    </a>
                </p>
            </div>
        </main>
    );
}
