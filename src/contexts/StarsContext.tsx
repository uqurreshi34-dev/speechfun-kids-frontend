// contexts/StarsContext.tsx (drop-in)
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface StarsContextType {
    stars: number;
    authToken: string | null;
    completedChallenges: Set<number>;
    refreshStars: () => Promise<void>;
    addStar: (challengeId: number, challengeType?: 'letter' | 'yes_no') => Promise<boolean>;
    loading: boolean;
}

const StarsContext = createContext<StarsContextType | undefined>(undefined);

export function StarsProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [stars, setStars] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    // ✨ NEW: Track if we've already loaded to prevent redundant refreshes
    const hasLoadedRef = useRef(false);

    // Get auth token (unchanged)
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

    const refreshStars = useCallback(async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/challenges/progress/`, {
                headers: { Authorization: `Token ${authToken}` },
            });

            const completed = new Set<number>(res.data.map((p: { challenge: number }) => p.challenge));
            setCompletedChallenges(completed);
            setStars(completed.size);
            hasLoadedRef.current = true; // ✨ NEW: Mark as loaded
        } catch (err) {
            console.error("Failed to load stars", err);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    // ✨ CHANGED: Only refresh on initial load, not on every authToken change
    useEffect(() => {
        if (authToken && !hasLoadedRef.current) {
            refreshStars();
        }
    }, [authToken, refreshStars]);

    const addStar = async (challengeId: number, challengeType: 'letter' | 'yes_no' = 'letter'): Promise<boolean> => {
        if (completedChallenges.has(challengeId)) return true;

        // Optimistic update
        setCompletedChallenges(prev => {
            const newSet = new Set(prev);
            newSet.add(challengeId);
            setStars(newSet.size);
            return newSet;
        });

        try {
            await axios.post(
                `${backendUrl}/api/challenges/progress/update/`,
                {
                    challenge: challengeId,
                    challenge_type: challengeType,
                    completed: true,
                    score: 100
                },
                { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
            );

            // ✨ REMOVED: The refreshStars() call here was causing the reload!
            // The optimistic update above is sufficient for UI responsiveness
            // If you need to sync from backend occasionally, do it on page navigation instead

            return true;
        } catch (err) {
            console.error("Failed to save star", err);
            // Rollback optimistic update
            setCompletedChallenges(prev => {
                const newSet = new Set(prev);
                newSet.delete(challengeId);
                setStars(newSet.size);
                return newSet;
            });
            return false;
        }
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
