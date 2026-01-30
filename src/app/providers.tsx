"use client";

import { SessionProvider } from "next-auth/react";
import { StarsProvider } from "@/contexts/StarsContext";


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
            <StarsProvider>
                {children}
            </StarsProvider>
        </SessionProvider>
    );
}
