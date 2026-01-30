// contexts/StarsContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface StarsContextType {
    stars: number;
    authToken: string | null;
    completedChallenges: Set<number>;
    refreshStars: () => Promise<void>;
    addStar: (challengeId: number) => void;
    loading: boolean;
}

const StarsContext = createContext<StarsContextType | undefined>(undefined);

export function StarsProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [stars, setStars] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);

    // Get auth token
    useEffect(() => {
        if (!session?.user?.email) return;

        const getAuthToken = async () => {
            try {
                const res = await axios.post(
                    `${backendUrl}/api/users/get-or-create-token/`,
                    {
                        email: session.user.email,
                        username: session.user.name || session.user.email,
                    }
                );
                setAuthToken(res.data.token);
            } catch (err) {
                console.error("Failed to get token", err);
            }
        };

        getAuthToken();
    }, [session]);

    // Load stars when token is ready
    const refreshStars = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
                headers: { Authorization: `Token ${authToken}` },
            });

            const completed = new Set<number>(res.data.map((p: { challenge: number }) => p.challenge));
            setCompletedChallenges(completed);
            setStars(completed.size);
        } catch (err) {
            console.error("Failed to load stars", err);
        } finally {
            setLoading(false);
        }
    };

    // Load stars initially
    useEffect(() => {
        if (authToken) {
            refreshStars();
        }
    }, [authToken]);

    // Add a star (optimistic update)
    const addStar = (challengeId: number) => {
        setCompletedChallenges((prev) => {
            const newSet = new Set(prev);
            newSet.add(challengeId);
            setStars(newSet.size);
            return newSet;
        });
    };

    return (
        <StarsContext.Provider value={{ stars, authToken, completedChallenges, refreshStars, addStar, loading }}>
            {children}
        </StarsContext.Provider>
    );
}

export function useStars() {
    const context = useContext(StarsContext);
    if (!context) {
        throw new Error('useStars must be used within StarsProvider');
    }
    return context;
}
