"use client";

import { useEffect } from "react";

export function useWarmBackend() {
    useEffect(() => {
        //silent wakeup call for render backend
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backend) {
            fetch(`${backend}/health/`).catch(() => { });
        }
    }, []);
}

