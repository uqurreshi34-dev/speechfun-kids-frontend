// app/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    // 1. Initialize state based on the presence of the token
    const [status, setStatus] = useState<"loading" | "success" | "error">(() =>
        !token ? "error" : "loading"
    );
    const [message, setMessage] = useState(() =>
        !token ? "Invalid verification link" : ""
    );

    useEffect(() => {
        if (!token) {
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/verify-email/?token=${token}`
                );

                setStatus("success");
                setMessage(response.data.detail || "Email verified successfully!");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login");
                }, 3000);

            } catch (err) {
                setStatus("error");
                if (axios.isAxiosError(err)) {
                    setMessage(err.response?.data?.detail || "Verification failed");
                } else {
                    setMessage("Verification failed");
                }
            }
        };

        verifyEmail();
    }, [token, router]);

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-700">Verifying your email...</p>
                </div>
            </main>
        );
    }

    if (status === "success") {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-green-200 text-center"
                >
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-3xl font-bold mb-4 text-green-600">
                        Email Verified!
                    </h1>
                    <p className="text-gray-700 mb-6">{message}</p>
                    <p className="text-gray-600 text-sm">
                        Redirecting to login page in 3 seconds...
                    </p>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-red-200 text-center"
            >
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-3xl font-bold mb-4 text-red-600">
                    Verification Failed
                </h1>
                <p className="text-gray-700 mb-6">{message}</p>
                <button
                    onClick={() => router.push("/register")}
                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl text-xl font-bold hover:opacity-90 transition"
                >
                    Try Again
                </button>
            </motion.div>
        </main>
    );
}

export default function VerifyEmail() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            </main>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

// User fills form on /register
//         ↓
// User clicks "Register Now!"
//         ↓
// Frontend calls backend API
//         ↓
// Backend creates inactive user + sends email
//         ↓
// Frontend shows "Check Your Email!" message
//         ↓
// User opens their email inbox
//         ↓
// User clicks "Verify My Email" button in email
//         ↓
// Browser opens: /verify-email?token=abc123
//         ↓
// /verify-email page calls backend API automatically
//         ↓
// Backend activates user account
//         ↓
// Success! Page shows "Email Verified!"
//         ↓
// After 3 seconds → redirect to /login
