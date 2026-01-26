// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

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
                        className="w-full bg-linear-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl text-xl font-bold hover:opacity-90 transition"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-xl font-bold transition"
                    >
                        Login with Google
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
